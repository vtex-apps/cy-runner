import { FAIL_ON_STATUS_CODE } from '../common/constants.js'
import { updateRetry } from '../common/support.js'

export function verifyTransactionInAffirm(
  { prefix, totalProductPrice, refundType, refundedAmount },
  { paymentTidEnv, orderIdEnv },
  refund = ''
) {
  it(`In ${prefix} - Verify Affirm Transaction`, updateRetry(6), () => {
    cy.addDelayBetweenRetries(4000)
    cy.getOrderItems().then((order) => {
      cy.getVtexItems().then((vtex) => {
        cy.request({
          url: `https://sandbox.affirm.com/api/v1/transactions/${order[paymentTidEnv]}`,
          auth: {
            username: vtex.appKey,
            password: vtex.appToken,
          },
          ...FAIL_ON_STATUS_CODE,
        }).then((response) => {
          expect(response.status).to.equal(200)
          expect(response.body.status).to.equal(
            refund ? refundType : 'captured'
          )
          // Affirm returns orderId like this 1256770739305
          // So, In 1256770739305-01 use split by - and fetch 1256770739305
          expect(response.body.order_id).to.equal(
            order[orderIdEnv].split('-')[0]
          )
          // Affirm returns amount like this 108500
          // So, In 1085.00 remove . from total amount
          expect(response.body.amount).to.equal(
            parseInt(totalProductPrice.replace('.', '').replace(',', ''), 10)
          )
          expect(response.body.id).to.equal(order[paymentTidEnv])
          refund &&
            expect(response.body.amount_refunded).to.equal(refundedAmount)
        })
      })
    })
  })
}
