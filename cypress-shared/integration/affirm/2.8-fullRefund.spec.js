import { singleProduct } from '../../support/affirm/outputvalidation.js'
import { refund } from '../../support/common/refund_apis.js'
import { getTestVariables } from '../../support/common/testcase.js'
import { loginViaCookies } from '../../support/common/support.js'
import { getRefundPayload } from '../../support/common/refund.js'
import { verifyTransactionInAffirm } from '../../support/affirm/api_testcase.js'

describe('Testing Affirm transaction API for full refund', () => {
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

  // Request full refund for the ordered product added in 2.1-singleProduct.spec.js & verify paypal transaction
  refund(
    {
      total: singleProduct.getFullRefundTotal, // Amount
      title: 'full', // Refund Type for test case title
      env: orderIdEnv, // variable name where we stored the orderid in node environment
    },
    getRefundPayload
  )

  verifyTransactionInAffirm(singleProduct, singleProductEnvs, true)
})
