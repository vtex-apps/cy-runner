import selectors from './common/selectors.js'
import {
  searchInMasterData,
  deleteDocumentInMasterData,
} from './common/wipe.js'
import { performImpersonation } from './b2b/common.js'
import 'cypress-file-upload'

function closeModalIfOpened() {
  cy.get('body').then(($body) => {
    if ($body.find('div[class*=vtex-modal__close]').length) {
      cy.get('div[class*=vtex-modal__close]').click()
    }
  })
}

export function scroll() {
  // So, scroll first then look for selectors
  cy.scrollTo(0, 1000)
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000)
  cy.scrollTo(0, -100)
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

Cypress.Commands.add('waitForGraphql', (operationName, selector = null) => {
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === operationName) {
        req.continue()
      }
    }).as(operationName)
    if (selector) cy.get(selector).last().click()
    cy.wait(`@${operationName}`, { timeout: 40000 })
  })
})

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
  cy.get(selectors.ProfileLabel, { timeout: 90000 }).should('be.visible')
  cy.get('body').then(($body) => {
    if (!$body.find(selectors.MyQuotes).length) cy.visit('/')
    if (!$body.find(selectors.QuoteSearchQuery).length) {
      cy.get(selectors.MyQuotes).should('be.visible').click()
    }

    cy.get(selectors.QuotesToolBar).should('be.visible')
  })
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

function fillContactInfo() {
  cy.get(selectors.QuantityBadge).should('be.visible')
  cy.get(selectors.SummaryCart).should('be.visible')
  cy.get(selectors.FirstName).clear().type('Syed', {
    delay: 50,
  })
  cy.get(selectors.LastName).clear().type('Mujeeb', {
    delay: 50,
  })
  cy.get(selectors.Phone).clear().type('(304) 123 4556', {
    delay: 50,
  })
  cy.get(selectors.ProceedtoShipping).should('be.visible').click()
  cy.get(selectors.ProceedtoShipping, { timeout: 1000 }).should(
    'not.be.visible'
  )
  cy.get('body').then(($shippingBlock) => {
    if ($shippingBlock.find(selectors.ReceiverName).length) {
      cy.get(selectors.ReceiverName, { timeout: 5000 }).type('Syed', {
        delay: 50,
      })
      cy.get(selectors.GotoPaymentBtn).should('be.visible').click()
    }
  })
}

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
