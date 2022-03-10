import selectors from '../../cypress-template/common_selectors.js'
import {
  searchInMasterData,
  deleteDocumentInMasterData,
} from '../../cypress-template/wipe.js'
import 'cypress-file-upload'

Cypress.Commands.add('searchInMasterData', searchInMasterData)
Cypress.Commands.add('deleteDocumentInMasterData', deleteDocumentInMasterData)

Cypress.Commands.add('waitForSession', (selector = null) => {
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === 'Session') {
        req.continue()
      }
    }).as('Session')
    if (selector) cy.get(selector).last().click()
    cy.wait('@Session', { timeout: 40000 })
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

Cypress.Commands.add('gotoMyOrganization', () => {
  cy.url().then((url) => {
    if (!url.includes('account')) {
      cy.get(selectors.ProfileLabel).should('be.visible')
      cy.get(selectors.SignInBtn).click()
      cy.get(selectors.MyAccount).click()
      cy.waitForSession()
    }
    cy.get(selectors.MyOrganization).click()
    cy.get(selectors.MyOrganizationCostCenterUserDiv).should('have.length', 4)
  })
})
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
    if (!$body.find(selectors.QuoteSearch).length)
      cy.get(selectors.MyQuotes).should('be.visible').click()
    cy.get(selectors.QuotesToolBar).should('be.visible')
  })
})

Cypress.Commands.add('gotoQuickOrder', () => {
  cy.get(selectors.Menu).should('be.visible').click()
  cy.get(selectors.QuickOrder).should('be.visible').click()
})

Cypress.Commands.add('searchProduct', (product) => {
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
      if (currentStatus == expectedStatus) return cy.wrap(false)
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
        } else return cy.wrap(false)
      })
  }
)
