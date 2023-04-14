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
      cy.qe(`Some modal been opened in the page. Let's close it`)
      cy.get('div[class*=vtex-modal__close]').click()
    }
  })
}

Cypress.Commands.add('closeMenuIfOpened', () => {
  cy.addDelayBetweenRetries(5000)
  cy.get('button[class*=closeIconButton]').then(($el) => {
    if (Cypress.dom.isVisible($el)) {
      cy.get('button[class*=closeIconButton]').first().click()
    }
  })
})

Cypress.Commands.add('searchInMasterData', searchInMasterData)
Cypress.Commands.add('deleteDocumentInMasterData', deleteDocumentInMasterData)
Cypress.Commands.add('performImpersonation', performImpersonation)

Cypress.Commands.add('waitForSession', (selector = null) => {
  cy.qe('Wait for the Session to be called in the page')
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === 'Session') {
        req.continue()
      }
    }).as('Session')

    if (selector) {
      cy.qe(`Click this ${selector}`)
      cy.get(selector).last().click()
    }

    cy.wait('@Session', { timeout: 20000 })
  })
})

Cypress.Commands.add(
  'waitForGraphql',
  (operationName, selector = null, contains = null, timeout = 30000) => {
    cy.getVtexItems().then((vtex) => {
      cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
        if (req.body.operationName === operationName) {
          req.continue()
        }
      }).as(operationName)

      if (selector && contains) {
        cy.scrollTo('top')
        cy.qe(`Click the button which has content ${selector} in it`)
        cy.contains(selector).should('be.visible').click()
      } else if (selector) {
        cy.qe(`Click the button which has selector ${selector} in it`)
        cy.get(selector).should('be.visible').last().click()
      } else if (contains) {
        cy.qe(`Click the button which has content ${contains} in it`)
        cy.contains(contains).should('be.visible').click()
      }

      cy.qe(
        `Wait for this graphql operation  ${operationName} to be called in the page`
      )
      cy.wait(`@${operationName}`, { timeout })
    })
  }
)

Cypress.Commands.add('fillAddressInCostCenter', (costCenter) => {
  const { country, postalCode, street, receiverName } = costCenter

  cy.qe(`For country dropdown, select ${country}`)
  cy.get(selectors.Country).should('not.be.disabled').select(country)
  cy.intercept('GET', `**/${postalCode}`).as('POSTALCODE')
  cy.qe(`For postalCode field, type ${postalCode}`)
  cy.get(selectors.PostalCode)
    .clear()
    .type(postalCode, { delay: 30 })
    .should('have.value', postalCode)
  cy.wait('@POSTALCODE')
  cy.qe(`For street field, type ${street}`)
  cy.get(selectors.Street)
    .clear()
    .type(street, { delay: 20 })
    .should('have.value', street)
  cy.qe(`Check state field is autofilled and not empty`)
  cy.get(selectors.State).invoke('val').should('not.be.empty')
  cy.qe(`Check city field is autofilled and not empty`)
  cy.get(selectors.City).invoke('val').should('not.be.empty')
  cy.qe(`For receiverName field, clear and type ${receiverName}`)
  cy.get(selectors.ReceiverNameinB2B)
    .clear()
    .type(receiverName)
    .should('have.value', receiverName)
})

Cypress.Commands.add(
  'gotoMyOrganization',
  (waitforSession = true, salesRepOrManager = false) => {
    cy.qe('ProfileLabel should be visible')
    cy.get(selectors.ProfileLabel).should('be.visible')

    cy.url().then((url) => {
      if (!url.includes('account')) {
        cy.qe('We are not in account page')
        cy.qe('Click SignInBtn')
        cy.get(selectors.SignInBtn).click()
        cy.qe('Click MyAccount')
        cy.get(selectors.MyAccount).click()
        if (waitforSession) cy.waitForSession()
      }

      closeModalIfOpened()
      cy.qe('Click MyOrganization link')
      cy.get(selectors.MyOrganization, { timeout: 40000 })
        .should('be.visible')
        .click()
      const noOfdivision = salesRepOrManager ? 2 : 4

      cy.qe(
        `This selector ${selectors.MyOrganizationCostCenterUserDiv} should have length ${noOfdivision} in current page`
      )

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
          if (!text.includes('Cost Center')) {
            cy.qe('Cost Center text is not found in the page')
            cy.qe("So, let's open the costCenter")
            cy.contains(costCenter).click()
          } else {
            cy.qe('Already in costcenter page')
          }
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

Cypress.Commands.add('gotoQuickOrder', (b2b = false) => {
  cy.location().then((loc) => {
    let closeMenu = false

    if (loc.pathname.includes('quickorder')) closeMenu = true
    if (b2b) {
      closeMenu && cy.closeMenuIfOpened()
      cy.get(selectors.Menu).should('be.visible').click()
      cy.get(selectors.QuickOrder).should('be.visible').click()
    } else {
      cy.qe(
        'Visit the QuickOrder home page: if the profile label is visible, then the profile label should contain Hello'
      )
      cy.visit('/quickorder')
      cy.get(selectors.ProfileLabel, { timeout: 20000 })
        .should('be.visible')
        .should('have.contain', `Hello,`)
    }

    cy.qe(`The Url should contain quickorder`)
    cy.url().should('include', 'quickorder')
  })
})

Cypress.Commands.add('searchProductinB2B', (product, available = true) => {
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
      .type(product, { force: true })
      .type('{enter}', { force: true })
    if (available) {
      cy.get(selectors.searchResult).should('be.visible')
      cy.get('article div[class*=storefront-permissions-ui]')
        .should('be.visible')
        .first()
        .scrollIntoView()
    }
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
  cy.qe('Fill contact information in checkout page')
  cy.get(selectors.FirstName).then(($el) => {
    if (Cypress.dom.isVisible($el)) {
      fillContactInfo()
    }
  })
  cy.qe('To make payment select Promissory payment')
  cy.get(selectors.PromissoryPayment).should('be.visible').click()
  cy.get(selectors.BuyNowBtn).last().should('be.visible').click()
  cy.get(selectors.Search, { timeout: 30000 }).should('be.visible')
})

Cypress.Commands.add('openStoreFront', (login = false) => {
  cy.intercept('**/rc.vtex.com.br/api/events').as('events')
  cy.qe('Visit store front')
  cy.visit('/')
  cy.wait('@events')
  if (login === true) {
    cy.get(selectors.ProfileLabel, { timeout: 20000 })
      .should('be.visible')
      .should('have.contain', `Hello,`)
  }

  scroll()
})


Cypress.Commands.add(
  'addNewLocation',
  (country, postalCode, street, city, retypePostalCode = false) => {
    cy.openStoreFront()
    cy.qe(
      'Address container should be visible in the top left of the home page'
    )
    cy.get(selectors.addressContainer, { timeout: 30000 })
      .should('be.visible')
      .click()
    cy.qe('Select a country')
    cy.get(selectors.countryDropdown).select(country)
    cy.qe('Type a postalcode')
    cy.get(selectors.addressInputContainer)
      .first()
      .clear()
      .should('be.visible')
      .type(postalCode, { delay: 10 })
    cy.get(selectors.SaveButtonInChangeLocationPopUp).should('be.visible')
    cy.qe('Type street address in address input')
    cy.get(selectors.Address)
      .contains('Address Line 1')
      .parent()
      .within(() => {
        cy.get(selectors.InputText).should('be.visible').clear().type(street)
      })
    cy.qe('Type a city')
    cy.get(selectors.Address)
      .contains('City')
      .parent()
      .within(() => {
        cy.get(selectors.InputText).should('be.visible').clear().type(city)
      })

    if (retypePostalCode) {
      cy.get(selectors.addressInputContainer)
        .first()
        .clear()
        .should('be.visible')
        .type(postalCode, { delay: 10 })
    }

    cy.waitForGraphql('setRegionId', selectors.SaveButtonInChangeLocationPopUp)
    cy.once('uncaught:exception', () => false)
  }
)

Cypress.Commands.add(
  'openProduct',
  (product, detailPage = false, searchPage = false) => {
    // Search product in search bar
    cy.get(selectors.Search).should('be.not.disabled').should('be.visible')
    cy.qe('Search product in search bar')
    cy.get(selectors.Search)
      .should('be.visible')
      .should('be.enabled')
      .clear()
      .type(product)
      .type('{enter}')
    // Page should load successfully now Filter should be visible
    cy.qe('Search result page should load successfully')
    cy.get(selectors.searchResult).should('have.text', product.toLowerCase())
    cy.get(selectors.FilterHeading, { timeout: 30000 }).should('be.visible')
    if (searchPage) {
      cy.qe(
        "If the search page is true, then it should show the message 'Shipping: Unavailable for'"
      )
      cy.get(selectors.locationUnavailable)
        .should('be.visible')
        .contains('Shipping: Unavailable for')
    }

    if (detailPage) {
      cy.qe('If detailPage is true,then it should go to product detail page')
      cy.gotoProductDetailPage()
    } else {
      cy.log('Visiting detail page is disabled')
    }
  }
)

function visitOrganizationPage() {
  cy.url().then((url) => {
    if (!url.includes('account')) {
      cy.get(selectors.ProfileLabel).should('be.visible')
      cy.get(selectors.SignInBtn).click()
      cy.get(selectors.MyAccount).click()
      cy.waitForSession()
    }

    closeModalIfOpened()
    cy.get('a[href*="profile"]').should('be.visible')
    cy.get('a[href*="wishlist"]').should('be.visible')
    cy.contains(selectors.QuotesAndSavedCarts).should('be.visible')
  })
}

Cypress.Commands.add('organizationShouldNotShowInProfile', () => {
  visitOrganizationPage()
  cy.get(selectors.MyOrganization, { timeout: 20000 }).should('not.exist')
})

Cypress.Commands.add('organizationShouldShowInProfile', () => {
  visitOrganizationPage()
  cy.get(selectors.MyOrganization, { timeout: 25000 }).should('be.visible')
})

const fedexJson = 'fedexPayload.json'

Cypress.Commands.add('setAppSettingstoJSON', (key, value) => {
  cy.readFile(fedexJson).then((items) => {
    items[key] = value
    cy.writeFile(fedexJson, items)
  })
})

Cypress.Commands.add('getAppSettingstoJSON', () => {
  cy.readFile(fedexJson).then((items) => {
    return items
  })
})

Cypress.Commands.add('hideSla', (hide) => {
  cy.readFile(fedexJson).then((items) => {
    const { slaSettings } = items.config.data.getAppSettings

    for (const ship in slaSettings) {
      slaSettings[ship].hidden = hide
    }

    return slaSettings
  })
})

Cypress.Commands.add('readSlaSettings', () => {
  cy.readFile(fedexJson).then((items) => {
    const { slaSettings } = items.config.data.getAppSettings

    return slaSettings
  })
})
