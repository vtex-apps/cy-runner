import { FAIL_ON_STATUS_CODE } from '../common/constants.js'

export function verifyTransactionInAffirm(
  { prefix, totalProductPrice },
  { paymentTidEnv, orderIdEnv },
  refund = false
) {
  it(`For ${prefix} - Verify Affirm Transaction`, () => {
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
          expect(response.body.status).to.equal('captured')
          // Affirm returns orderId like this 1256770739305
          // So, In 1256770739305-01 use split by - and fetch 1256770739305
          expect(response.body.order_id).to.equal(
            order[orderIdEnv].split('-')[0]
          )
          // Affirm returns amount like this 108500
          // So, In 1085.00 remove . from total amount
          expect(response.body.amount).to.equal(
            parseInt(totalProductPrice.replace('.', ''), 10)
          )
          expect(response.body.id).to.equal(order[paymentTidEnv])
          refund && expect(response.body.amount_refunded).to.equal('')
        })
      })
    })
  })
}

// {
//   "status": "captured",
//   "amount_refunded": 0,
//   "provider_id": 1,
//   "created": "2022-08-25T13:12:57Z",
//   "order_id": "1256770739305",
//   "checkout_id": "190PHRCC9I6IGQR3",
//   "currency": "USD",
//   "amount": 108500,
//   "events": [],
//   "remove_tax": false,
//   "authorization_expiration": "2022-09-24T13:13:14Z",
//   "id": "H3Y6-B7Y3"
// }
