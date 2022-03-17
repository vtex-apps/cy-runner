import { getRefundPayload } from './refund.js'
import { updateRetry } from './support.js'
import { workFlowAPI, startHandlingAPI } from './apis.js'
import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from './constants.js'
import { transactionConstants } from '../transaction_constants.js'

export function refund(total, title, envName) {
  const refundInvoiceNumber = '84321'

  it('Start handling', () => {
    cy.getVtexItems().then((vtex) => {
      cy.getOrderItems().then((order) => {
        cy.request({
          method: 'POST',
          url: startHandlingAPI(vtex.baseUrl, order[envName]),
          headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
          ...FAIL_ON_STATUS_CODE,
        }).then((response) => {
          expect(response.status).to.match(/204|409/)
        })
      })
    })
  })

  it(
    'Workflow API should have order status has invoiced',
    updateRetry(5),
    () => {
      cy.getVtexItems().then((vtex) => {
        cy.getOrderItems().then((order) => {
          cy.getAPI(
            workFlowAPI(vtex.baseUrl, order[envName]),
            VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken)
          ).then((response) => {
            expect(response.status).to.equal(200)
            expect(response.body.currentState).to.equal(
              transactionConstants.INVOICED
            )
          })
        })
      })
    }
  )

  it(`Request for ${title} refund`, () => {
    cy.getOrderItems().then((order) => {
      cy.sendInvoiceAPI(
        getRefundPayload(refundInvoiceNumber, total, order[envName]),
        order[envName]
      ).then((response) => {
        expect(response.status).to.match(/200|500/)
      })
    })
  })
}
