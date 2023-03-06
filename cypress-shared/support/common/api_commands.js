import { searchInMasterData, deleteDocumentInMasterData } from './wipe.js'
import {
  VTEX_AUTH_HEADER,
  FAIL_ON_STATUS_CODE,
  FAIL_ON_STATUS_CODE_STRING,
} from './constants.js'
import { invoiceAPI, cancelOrderAPI } from './apis.js'

Cypress.Commands.add('searchInMasterData', searchInMasterData)
Cypress.Commands.add('deleteDocumentInMasterData', deleteDocumentInMasterData)

// Send Invoice API Test Case
Cypress.Commands.add('sendInvoiceAPI', (body, orderId) => {
  cy.getVtexItems().then((vtex) => {
    const url = `${invoiceAPI(vtex.baseUrl)}/${orderId}/invoice`

    cy.callRestAPIAndAddLogs({
      url,
      body,
    })
  })
})

Cypress.Commands.add('cancelOrder', (orderId) => {
  cy.getVtexItems().then((vtex) => {
    cy.getOrderItems().then((item) => {
      const url = cancelOrderAPI(vtex.baseUrl, item[orderId])

      cy.callRestAPIAndAddLogs({
        url,
      }).then((response) => {
        expect(response.status).to.equal(200)
      })
    })
  })
})

// Get API Test Case
Cypress.Commands.add('getAPI', (url, headers, auth = null) => {
  cy.qe(`cy.request({
    method: 'GET',
    url: ${url},
    ${FAIL_ON_STATUS_CODE_STRING} 
  })`)
  cy.request({
    method: 'GET',
    url,
    auth,
    headers,
    ...FAIL_ON_STATUS_CODE,
  })
})

// Order Tax API Test Case
Cypress.Commands.add('orderTaxApi', (requestPayload, tax) => {
  cy.getVtexItems().then((vtex) => {
    cy.callRestAPIAndAddLogs({
      url: `${vtex.baseUrl}/${
        Cypress.env('workspace').prefix
      }/checkout/order-tax`,
      headers: {
        Authorization: vtex.authorizationHeader,
        ...VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
      },
      body: requestPayload,
    }).then((response) => {
      expect(response.status).to.equal(200)

      const reqIds = requestPayload.items.map(({ id }) => id)
      const respIds = response.body.itemTaxResponse.map(({ id }) => id)

      expect(reqIds.sort()).to.deep.equal(respIds.sort())
      let taxFromAPI = 0

      response.body.itemTaxResponse.forEach((item) => {
        item.taxes.map((obj) => (taxFromAPI += obj.value))
      })
      expect(taxFromAPI.toFixed(2)).to.equal(tax.replace('$ ', ''))
    })
  })
})
