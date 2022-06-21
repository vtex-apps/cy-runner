import { updateRetry } from './support.js'
import { workFlowAPI, startHandlingAPI } from './apis.js'
import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from './constants.js'

export function refund(
  { total, title, env },
  payload,
  { startHandling = true } = {}
) {
  const refundInvoiceNumber = '84321'

  if (startHandling) {
    it('Start handling', () => {
      cy.getVtexItems().then((vtex) => {
        cy.getOrderItems().then((order) => {
          cy.request({
            method: 'POST',
            url: startHandlingAPI(vtex.baseUrl, order[env]),
            headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
            ...FAIL_ON_STATUS_CODE,
          }).then((response) => {
            expect(response.status).to.match(/204|409/)
          })
        })
      })
    })
  }

  it(
    'Workflow API should have order status has invoiced',
    updateRetry(5),
    () => {
      cy.addDelayBetweenRetries(4000)
      cy.getVtexItems().then((vtex) => {
        cy.getOrderItems().then((order) => {
          cy.getAPI(
            workFlowAPI(vtex.baseUrl, order[env]),
            VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken)
          ).then((response) => {
            expect(response.status).to.equal(200)
            expect(response.body.currentState).to.equal('invoiced')
          })
        })
      })
    }
  )

  it(`Request for ${title} refund`, () => {
    cy.getOrderItems().then((order) => {
      cy.sendInvoiceAPI(
        payload(refundInvoiceNumber, total, order[env]),
        order[env]
      ).then((response) => {
        expect(response.status).to.match(/200|500/)
      })
    })
  })
}
