import selectors from './selectors.js'
import {
  addProduct,
  fillAddress,
  searchProduct,
  verifyTotal,
  updateProductQuantity,
  updateShippingInformation,
} from './support.js'
import { generateAddtoCartCardSelector } from './utils.js'

Cypress.Commands.add('addProduct', addProduct)
Cypress.Commands.add('fillAddress', fillAddress)
Cypress.Commands.add('searchProduct', searchProduct)
Cypress.Commands.add('updateProductQuantity', updateProductQuantity)
Cypress.Commands.add('updateShippingInformation', updateShippingInformation)
Cypress.Commands.add('verifyTotal', verifyTotal)

Cypress.Commands.add('getVtexItems', () => {
  return cy.wrap(Cypress.env().base.vtex, { log: false })
})

Cypress.Commands.add('getGmailItems', () => {
  return cy.wrap(Cypress.env().base.gmail, { log: false })
})

Cypress.Commands.add('addDelayBetweenRetries', (delay) => {
  if (cy.state('runnable')._currentRetry > 0) cy.wait(delay)
})

Cypress.Commands.add('closeCart', () => {
  cy.get('body').then(($body) => {
    if ($body.find(selectors.CloseCart).length) {
      cy.get(selectors.CloseCart).then(($el) => {
        if (Cypress.dom.isVisible($el)) {
          cy.get(selectors.CloseCart).click()
        }
      })
    }
  })
})

Cypress.Commands.add('getIframeBody', (selector) => {
  // get the iframe > document > body
  // and retry until the body element is not empty
  return (
    cy
      .get(selector)
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .should('be.visible')
      .should('not.be.undefined')

      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      // https://on.cypress.io/wrap
      .then(cy.wrap)
  )
})

Cypress.Commands.add('gotoProductDetailPage', () => {
  cy.get(selectors.ProductAnchorElement)
    .should('have.attr', 'href')
    .then((href) => {
      cy.get(generateAddtoCartCardSelector(href)).first().click()
    })
})
