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
