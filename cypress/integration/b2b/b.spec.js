/// <reference types="cypress" />

let config = Cypress.env()
const WKS = config.workspace.name
const APP_RETRIES = { retries: 2 }
const FAIL_TIMEOUT = { timeout: 1000 }

describe('Test B will pass', () => {
  it(`Some action on ${WKS}`, APP_RETRIES, () => {
    cy.log(WKS)
  })
})
