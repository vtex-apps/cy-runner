import { multiProduct } from '../../support/common/outputvalidation.js'
import { refund } from '../../support/common/refund_apis.js'
import { getTestVariables } from '../../support/common/testcase.js'
import { loginViaCookies } from '../../support/common/support.js'
import { getRefundPayload } from '../../support/common/refund.js'

describe('Testing Adyen transaction API for partial refund', () => {
  const multiProductEnvs = getTestVariables(multiProduct.prefix)
  const { orderIdEnv } = multiProductEnvs

  loginViaCookies()

  it('Verify whether we have an order to request for partial refund', () => {
    cy.getOrderItems().then((order) => {
      if (!order[orderIdEnv]) {
        throw new Error('Order id is missing')
      }
    })
  })

  // Request partial refund for the ordered product added in 2.3-multiProduct.spec.js
  refund(
    {
      total: multiProduct.getPartialRefundTotal, // Amount
      title: 'partial', // Refund Type for test case title
      env: orderIdEnv, // variable name where we stored the orderid in node environment
    },
    getRefundPayload,
    { startHandling: false }
  )
})
