/* eslint-disable vtex/prefer-early-return */
import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from '../common/constants'
import { updateRetry } from '../common/support'
import { invoiceAPI, startHandlingAPI } from '../common/apis'

const config = Cypress.env()
// Constants
const { apiKey, apiToken, baseUrl } = config.base.vtex

export function verifyOrderStatus({ product, env, status }) {
  it(
    `In ${product.prefix} - Change order state to ready for handling & Invoice API should have expected information`,
    updateRetry(8),
    () => {
      cy.addDelayBetweenRetries(10000)
      cy.getOrderItems().then((item) => {
        // Define constants
        const APP_NAME = 'vtex.taxjar'
        const APP_VERSION = '*.x'
        const APP = `${APP_NAME}@${APP_VERSION}`
        const CUSTOM_URL = `${baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`
        const GRAPHQL_MUTATION =
          'mutation' +
          `{changeState(orderId:"${item[env]}",newState:"ready-for-handling")}`

        cy.request({
          method: 'POST',
          url: CUSTOM_URL,
          ...FAIL_ON_STATUS_CODE,
          body: {
            query: GRAPHQL_MUTATION,
          },
        })
        cy.getAPI(
          `${invoiceAPI(baseUrl)}/${item[env]}`,
          VTEX_AUTH_HEADER(apiKey, apiToken)
        ).then((response) => {
          expect(response.status).to.equal(200)
          expect(response.body.status).to.equal(status)
        })
      })
    }
  )
}

export function startHandlingOrder(product, env) {
  it(`In ${product.prefix} - Start handling order`, updateRetry(3), () => {
    cy.addDelayBetweenRetries(5000)
    cy.getOrderItems().then((item) => {
      cy.request({
        method: 'POST',
        url: startHandlingAPI(baseUrl, item[env]),
        headers: VTEX_AUTH_HEADER(apiKey, apiToken),
        ...FAIL_ON_STATUS_CODE,
      }).then((response) => {
        expect(response.status).to.match(/204|409/)
      })
    })
  })
}

export function orderTaxAPITestCase(fixtureName, tax) {
  // Verify tax amounts via order-tax API
  it(
    `For ${fixtureName} - Verify tax amounts via order-tax API`,
    { retries: 0 },
    () => {
      // Load fixtures request payload and use them in orderTax API
      cy.fixture(fixtureName).then((requestPayload) => {
        cy.orderTaxApi(requestPayload, tax)
      })
    }
  )
}
