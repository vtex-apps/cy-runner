/* eslint-disable jest/expect-expect */
import { singleProduct } from '../../support/common/outputvalidation.js'
import { refund } from '../../support/common/refund_apis.js'
import { getRefundPayload } from '../../support/common/refund.js'
import { getTestVariables } from '../../support/common/testcase.js'
import { loginViaCookies } from '../../support/common/support.js'

describe('Testing Adyen transaction API for full refund', () => {
  const singleProductEnvs = getTestVariables(singleProduct.prefix)
  const { orderIdEnv } = singleProductEnvs

  loginViaCookies()

  it('Verify whether we have an order to request for full refund', () => {
    cy.getOrderItems().then((order) => {
      if (!order[orderIdEnv]) {
        throw new Error('Order id is missing')
      }
    })
  })

  // Request full refund for the ordered product added in 2.2-singleProduct.spec.js
  refund(
    {
      total: singleProduct.getFullRefundTotal, // Amount
      title: 'full', // Refund Type for test case title
      env: orderIdEnv, // variable name where we stored the orderid in node environment
    },
    getRefundPayload,
    { startHandling: false }
  )
})
