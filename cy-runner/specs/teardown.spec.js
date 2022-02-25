/// <reference types="cypress" />

import '../commands'

let config = Cypress.env()
const WKS = config.workspace.name
const APP_RETRIES = { retries: 2 }
const FAIL_TIMEOUT = { timeout: 1000 }

describe('Teardown', () => {
  it(`Deleting workspace ${WKS}`, APP_RETRIES, () => {
    if (WKS !== 'dev') {
      cy.vtex(`workspace delete -f ${WKS}`)
        .its('stdout', FAIL_TIMEOUT)
        .should('contain', 'deleted')
    }
  })
})
