/// <reference types="cypress" />

import '../support/commands'

let config = Cypress.env()

// Constants
const CONFIG = config.testConfig
const WORKSPACE = config.testWorkspace
const APPS = WORKSPACE.setup.manageApps
const STATE_FILE = CONFIG.stateFiles[0]
const FAIL_TIMEOUT = {timeout: 1000, log: false}
const APP_RETRIES = {retries: 2}

// Login page model
const TXT_EMAIL = '[name = "email"]'
const TXT_PASSWORD = '[name = "password"]'
const TXT_CODE = '[name = "code"]'

describe('Setting up the environment', () => {
  // Fail if any test fail after desired tries
  // eslint-disable-next-line func-names
  afterEach(function () {
    if (
      this.currentTest.currentRetry() === this.currentTest.retries() &&
      this.currentTest.state === 'failed'
    ) {
      Cypress.runner.stop()
    }
  })

  if (WORKSPACE.setup.enabled) {

    // Test if VTEX CLI is installed doing a logout
    it('Checking VTEX CLI', () => {
      cy.vtex('logout')
        .its('stdout', FAIL_TIMEOUT)
        .should('contain', 'See you soon')
    })

    // Start VTEX CLI Authentication (the VTEX CLI is a version modified to work that way)
    it('Authenticating on vtex cli', () => {
      // Try to load VTEX CLI callback URL
      cy.readFile('.toolbelt.url', FAIL_TIMEOUT).then(callBackUrl => {
        cy.visit(callBackUrl)
        // Intercept doesn't work, we must wait
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000)
        cy.get('body').then(($body) => {
          if ($body.find(TXT_EMAIL).length) {
            // Fill Robot email
            cy.get(TXT_EMAIL)
              .should('be.visible')
              .type(`${CONFIG.vtex.robotMail}{enter}`, {log: false})
            // Fill Robot password
            cy.get(TXT_PASSWORD)
              .should('be.visible')
              .type(`${CONFIG.vtex.robotPassword}{enter}`, {log: false})
          }
        })

        // Sometimes the system ask for SMS Code, we must wait
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000)

        // Fill Robot SMS code
        cy.get('body').then(($body) => {
          if ($body.find(TXT_CODE).length) {
            if (CONFIG.twilio.enabled) {
              let sid = CONFIG.twilio.apiUser
              let token = CONFIG.twilio.apiToken
              let url = `${CONFIG.twilio.baseUrl}/${sid}/Messages.json?PageSize=5`
              // Get SMS Code
              cy.getTwilioOTP(url, sid, token, 5000).then((code) => {
                cy.get(TXT_CODE).should('be.visible').type(`${code}{enter}`)
              })
            } else {
              cy.log('Twilio disabled on cy-runner.yml, inform it manually')
              cy.pause()
            }
          }
        })
        // Wait for the authentication process to finish
        cy.get('body').should('contain', 'You may now close this window.')
      })
    })
  }

  // Get Cookie Credential
  it('Getting admin auth cookie', () => {
    // Get Cookie Credential
    cy.request({
      method: 'GET',
      url: CONFIG.vtex.idUrl,
      qs: {user: CONFIG.vtex.apiKey, pass: CONFIG.vtex.apiToken},
    }).then((response) => {
      expect(response.body).property('authStatus').to.equal('Success')
      let cookie = 'authCookieValue'
      CONFIG.vtex[cookie] = response.body.authCookie.Value
      cy.addConfig(STATE_FILE, 'testConfig', 'vtex', cookie, CONFIG.vtex[cookie])
    })
  })

  // Get Robot Cookie and saving it
  it('Getting robot cookie', () => {
    cy.vtex('whoami').its('stdout').should('contain', 'Logged into')
    cy.vtex('local token').then((cookie) => {
      // Here we should use a state file, if we try to write directly on cypress.env.json
      // Cypress crashes
      cy.addConfig(STATE_FILE, 'testConfig', 'vtex', 'robotCookie', cookie.stdout)
    })
  })

  if (APPS.enabled) {
    // Create a new workspace
    it(`Creating workspace ${WORKSPACE.name}`, () => {
      cy.vtex(`workspace use ${WORKSPACE.name}`)
        .its('stdout')
        .should('contain', WORKSPACE.name)
    })

    // Install B2B apps
    APPS.install.forEach((app) => {
      it(`Installing ${app}`, APP_RETRIES, () => {
        cy.vtex(`install ${app}`)
          .its('stdout', FAIL_TIMEOUT)
          .should('contains', 'successfully')
      })
    })

    // Uninstall master's theme and the app to be linked
    APPS.uninstall.push(APPS.link)
    APPS.uninstall.forEach((app) => {
      it(`Removing ${app}`, APP_RETRIES, () => {
        cy.vtex(`uninstall ${app}`)
          .its('stdout', FAIL_TIMEOUT)
          .should('contains', 'successfully')
      })
    })

    // Link app to test
    it.skip(`Linking ${APPS.link}`, APP_RETRIES, () => {
      cy.vtex('link').should('contains', 'successfully')
    })
  }
})
