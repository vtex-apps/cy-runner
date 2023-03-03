import { FAIL_ON_STATUS_CODE_STRING, FAIL_ON_STATUS_CODE } from './constants.js'
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
  if (variables) {
    // eslint-disable-next-line no-extra-boolean-cast
    if (!process.env.CI) {
      cy.qe(`We are in CI mode, Skip writting variables inside logs`)
    } else {
      cy.qe(`Variables - ${JSON.stringify(variables)}`)
    }
  }
})

Cypress.Commands.add(
  'callRestAPIAndAddLogs',
  ({
    method = 'POST',
    url,
    body = null,
    headers = null,
    auth = null,
    form = false,
  } = {}) => {
    cy.qe(
      `if we get any permission denied error on running below API in postman then use  VtexClientAuthCookie/ Vtex Api key,token \n cy.request({method: ${method},url: ${url},body:${JSON.stringify(
        body
      )},form:${form},${FAIL_ON_STATUS_CODE_STRING}})`
    )

    cy.request({
      url,
      method,
      body,
      headers,
      auth,
      form,
      ...FAIL_ON_STATUS_CODE,
    })
  }
)

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
  if (cy.state('runnable')._currentRetry > 0) {
    cy.qe(`Wait for ${delay} seconds`)
    cy.wait(delay)
  }
})

Cypress.Commands.add('addReloadBetweenRetries', () => {
  if (cy.state('runnable')._currentRetry > 0) {
    cy.qe('Reload the page')
    cy.reload()
  }
})

Cypress.Commands.add('reloadOnLastNAttempts', (n = 1) => {
  const retries = cy.state('runnable')._retries
  const currentRetry = cy.state('runnable')._currentRetry

  if (n > retries) {
    cy.log('Reload will be happen on every attempts')
  } else if (n === 0) {
    cy.lod('n is 0, So, reload will not be happened on any of the attempts')
  }

  /*
    Retries would be constant on all attempts
    Say, we set retries as 3 for it block and n as 2
    Then reload will happen on last 2 attempts

    Formula ->> retries-currentRetry<n then reload

    Iteration 1: retries=3,currentRetry=0,n=2
    3-0 < 2 -> False -> Reload will not happen
    Iteration 2: retries=3,currentRetry=1,n=2
    3-1 < 2 -> False -> Reload will not happen
    Iteration 3: retries=3,currentRetry=2,n=2
    3-2 < 2 -> True -> Reload will happen
    Iteration 4: retries=3,currentRetry=3,n=2
    3-3 < 2 -> True -> Reload will happen
  */
  if (retries - currentRetry < n) cy.reload()
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
