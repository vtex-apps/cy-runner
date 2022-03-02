/// <reference types="cypress" />
let config = Cypress.env()
const WORKSPACE = config.testWorkspace
const APP_RETRIES = { retries: 2 }
const FAIL_TIMEOUT = { timeout: 1000 }

describe('Teardown', () => {
  it(`Removing workspace ${WORKSPACE.name}`, APP_RETRIES, () => {
    cy.vtex(`workspace delete -f ${WORKSPACE.name}`)
      .its('stdout', FAIL_TIMEOUT)
      .should('contain', 'deleted')
  })
})
