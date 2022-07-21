import { updateRetry } from './support.js'
import { workFlowAPI, startHandlingAPI } from './apis.js'
import {
  FAIL_ON_STATUS_CODE,
  VTEX_AUTH_HEADER,
  INVOICE_STATUSES,
} from './constants.js'

export function sendInvoiceTestCase({
  product,
  prefix,
  orderIdEnv,
  externalSeller,
}) {
  let total

  it(`In ${prefix} - Send Invoice`, () => {
    cy.getOrderItems().then((item) => {
      if (externalSeller !== undefined) {
        if (externalSeller.directSaleEnv === orderIdEnv) {
          total = externalSeller.directSaleAmount
        } else {
          total = externalSeller.externalSellerAmount
        }
      }
      // If this is not externalSellerTestCase then it is for refund test case
      else {
        total = product.totalWithoutTax
      }

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
        item[orderIdEnv],
        orderIdEnv === externalSeller.externalSaleEnv
      ).then((response) => {
        expect(response.status).to.equal(200)
      })
    })
  })
}

export function startHandlingTestCase({ prefix, env }) {
  it(`In ${prefix} - Start handling`, updateRetry(3), () => {
    cy.addDelayBetweenRetries(1000)
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

export function verifyInvoiceStatus({ prefix, env }, status) {
  const title = prefix ? `In ${prefix} - ` : ''

  it(
    `${title} Workflow API should have order status has ${status}`,
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
            if (status === INVOICE_STATUSES.readyForHandling) {
              startHandlingTestCase({ prefix, env })
            } else {
              expect(response.body.currentState).to.match(/invoiced|handling/)
            }
          })
        })
      })
    }
  )
}

export function verifyInvoiceAndStartHandlingTestCase({ prefix, env }) {
  verifyInvoiceStatus({ prefix, env }, INVOICE_STATUSES.readyForHandling)
}
