/* eslint-disable vtex/prefer-early-return */
// / <reference types="cypress" />
import { getAccessToken } from '../../../cypress-shared/support/extract.js'

const config = Cypress.env()

// Constants
const { vtex } = config.base
const { twilio, gmail } = config.base
const FAIL_TIMEOUT = { retries: 5, timeout: 10000, log: false }
const TXT_EMAIL = '[name = "email"]'
const TXT_PASSWORD = '[name = "password"]'
const TXT_CODE = '[name = "code"]'
const TOKEN_INPUT = '[data-testid="token-input"]'
const TOKEN_SCREEN_CONTINUE = '[data-testid="token-screen-continue"]'

function fillEmailAndPassword() {
  cy.get('body').then(($body) => {
    if ($body.find(TXT_EMAIL).length) {
      cy.intercept('POST', '**/startlogin').as('startlogin')
      cy.intercept('POST', '**/accesskey/send').as('send')
      // Fill Robot email
      cy.get(TXT_EMAIL)
        .should('be.visible')
        .type(`${vtex.robotMail}{enter}`, { log: false })
      if (!vtex.robotMail.includes('vtex')) {
        cy.intercept('**/validate').as('validate')
        // Fill Robot password
        cy.get(TXT_PASSWORD)
          .should('be.visible')
          .type(`${vtex.robotPassword}{enter}`, { log: false })
        cy.wait('@validate')
      } else {
        cy.wait('@startlogin').its('response.statusCode').should('eq', 200)
        cy.wait('@send').its('response.statusCode').should('eq', 200)
      }
    }
  })
}

async function fillAccessCodeForVtexEmail() {
  const { id, clientId, clientSecret, refreshToken } = gmail

  if (id && clientId && clientSecret && refreshToken) {
    const newAccessToken = await getAccessToken(id, gmail)

    cy.get(TOKEN_INPUT).should('be.visible').type(`${newAccessToken}`)
    cy.get(TOKEN_SCREEN_CONTINUE).should('be.visible').click()
  } else {
    throw new Error(
      'Some of the keys (id, clientId, clientSecret, refreshToken) are missing'
    )
  }
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

      cy.get('body').then(async ($body) => {
        if (vtex.robotMail.includes('vtex')) {
          await fillAccessCodeForVtexEmail()
        } else if ($body.find(TXT_CODE).length) {
          // Non vtex email logic
          // Fill Robot SMS code if Twilio enabled, pause if not

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
