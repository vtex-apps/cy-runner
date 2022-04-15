import { searchInMasterData, deleteDocumentInMasterData } from './wipe.js'
import { VTEX_AUTH_HEADER, FAIL_ON_STATUS_CODE } from './constants.js'
import { invoiceAPI } from './apis.js'

Cypress.Commands.add('searchInMasterData', searchInMasterData)
Cypress.Commands.add('deleteDocumentInMasterData', deleteDocumentInMasterData)

// Send Invoice API Test Case
Cypress.Commands.add('sendInvoiceAPI', (body, orderId, externalSellerTotal) => {
  cy.getVtexItems().then((vtex) => {
    const url = `${
      externalSellerTotal
        ? invoiceAPI(vtex.urlExternalSeller)
        : invoiceAPI(vtex.baseUrl)
    }/${orderId}/invoice`

    cy.request({
      method: 'POST',
      url,
      headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
      ...FAIL_ON_STATUS_CODE,
      body,
    })
  })
})

// Get API Test Case
Cypress.Commands.add('getAPI', (url, headers) => {
  cy.request({
    method: 'GET',
    url,
    headers,
    ...FAIL_ON_STATUS_CODE,
  })
})

// Order Tax API Test Case
Cypress.Commands.add('orderTaxApi', (requestPayload, tax) => {
  cy.getVtexItems().then((vtex) => {
    cy.request({
      method: 'POST',
      url: `${vtex.baseUrl}/${
        Cypress.env('workspace').prefix
      }/checkout/order-tax`,
      headers: {
        Authorization: vtex.authorization,
        ...VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
      },
      ...FAIL_ON_STATUS_CODE,
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
