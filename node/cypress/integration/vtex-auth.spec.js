/* eslint-disable vtex/prefer-early-return */
// / <reference types="cypress" />
const config = Cypress.env()

// Constants
const { vtex } = config.base
const { twilio } = config.base
const FAIL_TIMEOUT = { retries: 5, timeout: 10000, log: false }
const TXT_EMAIL = '[name = "email"]'
const TXT_PASSWORD = '[name = "password"]'
const TXT_CODE = '[name = "code"]'

function fillEmailAndPassword() {
  cy.get('body').then(($body) => {
    if ($body.find(TXT_EMAIL).length) {
      // Fill Robot email
      cy.get(TXT_EMAIL)
        .should('be.visible')
        .type(`${vtex.robotMail}{enter}`, { log: false })
      cy.intercept('**/validate').as('validate')
      // Fill Robot password
      cy.get(TXT_PASSWORD)
        .should('be.visible')
        .type(`${vtex.robotPassword}{enter}`, { log: false })
      cy.wait('@validate')
    }
  })
}

describe('Authentication process', () => {
  // Log in with given credentials
  it('Authenticating vtex cli', () => {
    cy.readFile('.toolbelt.url', FAIL_TIMEOUT).then((callBackUrl) => {
      cy.intercept('**/rc.vtex.com.br/api/events').as('events')
      cy.intercept('**/refreshtoken/admin').as('admin')
      cy.visit(callBackUrl)
      cy.wait('@events')
      cy.wait('@admin')

      fillEmailAndPassword()

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000)

      // Fill Robot SMS code if Twilio enabled, pause if not
      cy.get('body').then(($body) => {
        if ($body.find(TXT_CODE).length) {
          if (twilio.enabled) {
            const sid = twilio.apiUser
            const token = twilio.apiToken
            const url = `${twilio.baseUrl}/${sid}/Messages.json?PageSize=5`

            // Get SMS Code
            cy.twilioOtp({ url, sid, token }, 10000).then((code) => {
              cy.get(TXT_CODE).should('be.visible').type(`${code}{enter}`)
            })
          } else {
            throw new Error('Twilio disabled, impossible do vtex cli login')
          }
        }
      })
      // Wait for authentication
      cy.get('body').should('contain', 'You may now close this window.')
    })
  })
})
