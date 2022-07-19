import selectors from './common/selectors.js'
import {
  searchInMasterData,
  deleteDocumentInMasterData,
} from './common/wipe.js'
import { performImpersonation } from './b2b/common.js'
import 'cypress-file-upload'
import { fillContactInfo, scroll } from './common/support.js'

function closeModalIfOpened() {
  cy.get('body').then(($body) => {
    if ($body.find('div[class*=vtex-modal__close]').length) {
      cy.get('div[class*=vtex-modal__close]').click()
    }
  })
}

Cypress.Commands.add('searchInMasterData', searchInMasterData)
Cypress.Commands.add('deleteDocumentInMasterData', deleteDocumentInMasterData)
Cypress.Commands.add('performImpersonation', performImpersonation)

Cypress.Commands.add('waitForSession', (selector = null) => {
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === 'Session') {
        req.continue()
      }
    }).as('Session')
    if (selector) cy.get(selector).last().click()
    cy.wait('@Session', { timeout: 20000 })
  })
})

Cypress.Commands.add(
  'waitForGraphql',
  (operationName, selector = null, contains = null) => {
    cy.getVtexItems().then((vtex) => {
      cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
        if (req.body.operationName === operationName) {
          req.continue()
        }
      }).as(operationName)

      if (selector && contains) {
        cy.scrollTo('top')
        cy.contains(selector).click()
      } else if (selector) {
        cy.get(selector).last().click()
      }

      cy.wait(`@${operationName}`, { timeout: 30000 })
    })
  }
)

Cypress.Commands.add('fillAddressInCostCenter', (costCenter) => {
  const { country, postalCode, street, receiverName } = costCenter

  cy.get(selectors.Country).should('not.be.disabled').select(country)
  cy.intercept('GET', `**/${postalCode}`).as('POSTALCODE')
  cy.get(selectors.PostalCode)
    .clear()
    .type(postalCode)
    .should('have.value', postalCode)
  cy.wait('@POSTALCODE')
  cy.get(selectors.Street).clear().type(street).should('have.value', street)
  cy.get(selectors.State).invoke('val').should('not.be.empty')
  cy.get(selectors.City).invoke('val').should('not.be.empty')
  cy.get(selectors.ReceiverNameinB2B)
    .clear()
    .type(receiverName)
    .should('have.value', receiverName)
})

Cypress.Commands.add(
  'gotoMyOrganization',
  (waitforSession = true, salesRepOrManager = false) => {
    cy.url().then((url) => {
      if (!url.includes('account')) {
        cy.get(selectors.ProfileLabel).should('be.visible')
        cy.get(selectors.SignInBtn).click()
        cy.get(selectors.MyAccount).click()
        if (waitforSession) cy.waitForSession()
      }

      closeModalIfOpened()
      cy.get(selectors.MyOrganization).click()
      const noOfdivision = salesRepOrManager ? 2 : 4

      cy.get(selectors.MyOrganizationCostCenterUserDiv).should(
        'have.length',
        noOfdivision
      )
    })
  }
)
Cypress.Commands.add('gotoCostCenter', (costCenter) => {
  cy.get('body').then(($body) => {
    if ($body.find('div[class*=pageHeader__title]').length) {
      cy.get('div[class*=pageHeader__title]')
        .invoke('text')
        .then((text) => {
          if (!text.includes('Cost Center')) cy.contains(costCenter).click()
        })
    }
  })
})

Cypress.Commands.add('gotoMyQuotes', () => {
  cy.get(selectors.ProfileLabel, { timeout: 20000 }).should('be.visible')
  cy.scrollTo('top')
  cy.get('body').then(($body) => {
    if (!$body.find(selectors.ToggleFields).length) {
      cy.get(selectors.MyQuotes, { timeout: 10000 })
        .should('be.visible')
        .click()
    }
  })
  cy.get(selectors.QuotesToolBar, { timeout: 20000 }).should('be.visible')
})

Cypress.Commands.add('gotoQuickOrder', () => {
  cy.get(selectors.Menu).should('be.visible').click()
  cy.get(selectors.QuickOrder).should('be.visible').click()
})

Cypress.Commands.add('searchProductinB2B', (product) => {
  cy.url().then((url) => {
    if (url.includes('checkout')) {
      cy.visit('/')
    }

    cy.get(selectors.ProfileLabel).should('be.visible')
    // Search product in search bar
    cy.get(selectors.Search)
      .first()
      .should('be.visible')
      .should('be.enabled')
      .clear()
      .type(product)
      .type('{enter}')
  })
})

Cypress.Commands.add('checkStatusAndReject', (expectedStatus) => {
  cy.get(selectors.QuoteStatus)
    .first()
    .invoke('text')
    .then((currentStatus) => {
      if (currentStatus === expectedStatus) return cy.wrap(false)

      return cy.wrap(true)
    })
})

Cypress.Commands.add(
  'checkAndFillData',
  (selector, expectedText, position = 0) => {
    cy.get(selector)
      .eq(position)
      .invoke('val')
      .then((text) => {
        if (text !== expectedText) {
          cy.get(selector).eq(position).clear().type(expectedText)

          return cy.wrap(true)
        }

        return cy.wrap(false)
      })
  }
)

Cypress.Commands.add('orderProduct', () => {
  cy.get(selectors.FirstName).then(($el) => {
    if (Cypress.dom.isVisible($el)) {
      fillContactInfo()
    }
  })
  cy.get(selectors.PromissoryPayment).click()
  cy.get(selectors.BuyNowBtn).last().click()
})

Cypress.Commands.add('openStoreFront', (login = false) => {
  cy.intercept('**/rc.vtex.com.br/api/events').as('events')
  cy.visit('/')
  cy.wait('@events')
  if (login === true) {
    cy.get(selectors.ProfileLabel, { timeout: 20000 })
      .should('be.visible')
      .should('have.contain', `Hello,`)
  }

  scroll()
})

Cypress.Commands.add('addNewLocation', (country, PostalCode) => {
  cy.openStoreFront()
  cy.get(selectors.addressContainer).click()
  cy.get(selectors.countryDropdown).select(country)
  cy.get(selectors.addressInputContainer)
    .first()
    .clear()
    .should('be.visible')
    .type(PostalCode)
  cy.get(selectors.Address)
    .contains('Address Line 1')
    .parent()
    .within(() => {
      cy.get("input[type='text']")
        .clear()
        .type('1481 Maple View Dr,Promona,CA,USA')
    })
  cy.get(selectors.Address)
    .contains('City')
    .parent()
    .within(() => {
      cy.get("input[type='text']").clear().type('Promona')
    })
  cy.get(selectors.SelectState).select('California')
  cy.waitForGraphql('address', selectors.SaveButton)
  cy.once('uncaught:exception', () => false)
})

Cypress.Commands.add('openProduct', (product, detailPage = false) => {
  // Search product in search bar
  cy.get(selectors.Search).should('be.not.disabled').should('be.visible')

  cy.get(selectors.Search)
    .should('be.enabled')
    .clear()
    .type(product)
    .type('{enter}')
  // Page should load successfully now Filter should be visible
  cy.get(selectors.searchResult).should('have.text', product.toLowerCase())
  cy.get(selectors.FilterHeading, { timeout: 30000 }).should('be.visible')

  if (detailPage) {
    cy.gotoProductDetailPage()
  } else {
    cy.log('Visiting detail page is disabled')
  }
})
