import selectors from './selectors.js'
import {
  addProduct,
  fillAddress,
  searchProduct,
  verifyTotal,
  updateProductQuantity,
  updateShippingInformation,
  saveOrderId,
} from './support.js'
import { generateAddtoCartCardSelector } from './utils.js'

Cypress.Commands.add('qe', (msg = '') => {
  const logFile = `${
    Cypress.spec.absolute.split('cy-runner')[0]
  }cy-runner/logs/${Cypress.spec.name.split('/').at(-1)}.log`

  cy.writeFile(logFile, msg ? `${msg}\n` : msg, { flag: msg ? 'a+' : 'w' })
  cy.log(msg)
})

Cypress.Commands.add('addGraphqlLogs', (query, variables) => {
  cy.qe(`Query - ${query}`)
  variables &&
    !process.env.CI &&
    cy.qe(`Variables - ${JSON.stringify(variables)}`)
})

Cypress.Commands.add('addProduct', addProduct)
Cypress.Commands.add('fillAddress', fillAddress)
Cypress.Commands.add('searchProduct', searchProduct)
Cypress.Commands.add('updateProductQuantity', updateProductQuantity)
Cypress.Commands.add('updateShippingInformation', updateShippingInformation)
Cypress.Commands.add('verifyTotal', verifyTotal)

Cypress.Commands.add('getVtexItems', () => {
  return cy.wrap(Cypress.env().base.vtex, { log: false })
})

Cypress.Commands.add('addDelayBetweenRetries', (delay) => {
  if (cy.state('runnable')._currentRetry > 0) cy.wait(delay)
})

Cypress.Commands.add('addReloadBetweenRetries', () => {
  if (cy.state('runnable')._currentRetry > 0) cy.reload()
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

Cypress.Commands.add(
  'orderProduct',
  ({
    paymentSelector = selectors.PromissoryPayment,
    orderIdEnv = null,
    externalSeller = null,
  } = {}) => {
    cy.get('body').then(($body) => {
      cy.qe({ msg: `Select the payment option and order the product` })
      if ($body.find(selectors.FillInvoiceAddress).length === 2) {
        cy.get(selectors.FillInvoiceAddress).last().should('be.visible').click()
      }

      if ($body.find(selectors.ReceiverName).length) {
        cy.get(selectors.ReceiverName, {
          timeout: 5000,
        }).type('Syed')
      }
    })

    cy.get('body').then(($body) => {
      if ($body.find(selectors.GotoPaymentBtn).length) {
        cy.get(selectors.GotoPaymentBtn).click()
      }
    })

    cy.get(paymentSelector, { timeout: 5000 }).should('be.visible').click()

    cy.get(selectors.BuyNowBtn, {
      timeout: 10000,
    })
      .should('be.visible')
      .last()
      .click()
    cy.get(selectors.Search, { timeout: 30000 }).should('be.visible')
    // if orderIdEnv or externalSeller is must be passed then only we store orderId
    // otherwise we just verify order is placed or not
    saveOrderId(orderIdEnv, externalSeller)
  }
)

const orderFormDebugJSON = '_orderFormDebug.json'

// Set Debug items
Cypress.Commands.add('setorderFormDebugItem', () => {
  cy.window().then(($win) => {
    cy.readFile(orderFormDebugJSON).then((items) => {
      items[Cypress.currentTest.titlePath] = $win.vtexjs.checkout.orderForm
      cy.writeFile(orderFormDebugJSON, items)
    })
  })
})
