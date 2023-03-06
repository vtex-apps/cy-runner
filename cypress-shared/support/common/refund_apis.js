import { updateRetry } from './support.js'
import { workFlowAPI, startHandlingAPI } from './apis.js'
import { VTEX_AUTH_HEADER } from './constants.js'

export function refund(
  { total, externalSeller, title, env },
  payload,
  { startHandling = true, sendInvoice = false } = {}
) {
  const refundInvoiceNumber = '84321'

  if (startHandling) {
    it('Start handling', () => {
      cy.getVtexItems().then((vtex) => {
        cy.getOrderItems().then((order) => {
          cy.callRestAPIAndAddLogs({
            url: startHandlingAPI(vtex.baseUrl, order[env]),
          }).then((response) => {
            expect(response.status).to.match(/204|409/)
          })
        })
      })
    })
  }

  if (sendInvoice && externalSeller) {
    it('Send Invoice', () => {
      cy.getOrderItems().then((order) => {
        cy.sendInvoiceAPI(
          {
            invoiceNumber: '54321',
            invoiceValue: total
              .replace('$ ', '')
              .replace(/\./, '')
              .replace(/,/, ''),
            invoiceUrl: null,
            issuanceDate: new Date(),
            invoiceKey: null,
          },
          order[env],
          env === externalSeller.externalSaleEnv
        ).then((response) => {
          expect(response.status).to.equal(200)
        })
      })
    })
  }

  it(
    'Workflow API should have order status has invoiced',
    updateRetry(5),
    () => {
      cy.addDelayBetweenRetries(5000)
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
