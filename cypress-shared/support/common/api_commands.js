import { searchInMasterData, deleteDocumentInMasterData } from './wipe.js'
import { VTEX_AUTH_HEADER, FAIL_ON_STATUS_CODE } from './constants.js'
import { invoiceAPI, cancelOrderAPI } from './apis.js'

Cypress.Commands.add('searchInMasterData', searchInMasterData)
Cypress.Commands.add('deleteDocumentInMasterData', deleteDocumentInMasterData)

// Send Invoice API Test Case
Cypress.Commands.add('sendInvoiceAPI', (body, orderId) => {
  cy.getVtexItems().then((vtex) => {
    const url = `${invoiceAPI(vtex.baseUrl)}/${orderId}/invoice`

    cy.request({
      method: 'POST',
      url,
      headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
      ...FAIL_ON_STATUS_CODE,
      body,
    })
  })
})

Cypress.Commands.add('cancelOrder', (orderId) => {
  cy.getVtexItems().then((vtex) => {
    cy.getOrderItems().then((item) => {
      const url = cancelOrderAPI(vtex.baseUrl, item[orderId])

      cy.request({
        method: 'POST',
        url,
        headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
        ...FAIL_ON_STATUS_CODE,
      }).then((response) => {
        expect(response.status).to.equal(200)
      })
    })
  })
})

// Get API Test Case
Cypress.Commands.add('getAPI', (url, headers) => {
  cy.qe(`cy.request({
    method: 'GET',
    url: ${url},
    ${headers ? `headers: ${headers}` : ''}
    ${JSON.stringify(FAIL_ON_STATUS_CODE).replace('{', '').replace('}', '')}
  })`)
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
        Authorization: vtex.authorizationHeader,
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
