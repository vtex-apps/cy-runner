import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from './constants.js'

const generateSearchURL = (baseUrl, entities, searchQuery) => {
  return `${baseUrl}/api/dataentities/${entities.id}/search?${entities.searchKey}=${searchQuery}`
}

const generateDeleteURL = (baseUrl, entities, documentId) => {
  return `${baseUrl}/api/dataentities/${entities.id}/documents/${documentId}`
}

export function searchInMasterData(entities, searchQuery) {
  cy.getVtexItems().then((vtex) => {
    cy.request({
      url: generateSearchURL(vtex.baseUrl, entities, searchQuery),
      headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
      ...FAIL_ON_STATUS_CODE,
    }).then((response) => {
      expect(response.status).to.equal(200)

      return cy.wrap(response.body, { log: false })
    })
  })
}

export function deleteDocumentInMasterData(entities, id) {
  cy.getVtexItems().then((vtex) => {
    cy.request({
      method: 'DELETE',
      url: generateDeleteURL(vtex.baseUrl, entities, id),
      headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
      ...FAIL_ON_STATUS_CODE,
    })
      .its('status')
      .should('equal', 204)
  })
}
