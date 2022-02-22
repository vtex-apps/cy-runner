/// <reference types="cypress" />

// Env
let config = Cypress.env()
let stateFile = config.workspace.stateFiles[0]

// Constants
const FAIL_TIMEOUT = { timeout: 1000 }
const APP_RETRIES = { retries: 2 }
const APP_LINK = config.workspace.setup.link

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

  // Test if VTEX CLI is installed doing a logout
  it('Checking VTEX CLI', () => {
    cy.vtex('logout')
      .its('stdout', FAIL_TIMEOUT)
      .should('contain', 'See you soon')
  })

  // Get Cookie Credential
  it('Getting admin auth cookie', () => {
    // Get Cookie Credencial
    cy.request({
      method: 'GET',
      url: config.vtex.idUrl,
      qs: { user: config.vtex.apiKey, pass: config.vtex.apiToken },
    }).then((response) => {
      expect(response.body).property('authStatus').to.equal('Success')
      let cookie = 'authCookieValue'
      config.vtex[cookie] = response.body.authCookie.Value
      cy.addConfig(stateFile, 'vtex', cookie, config.vtex[cookie])
    })
  })

  // Start VTEX CLI Authentication (the VTEX CLI is a version modified to work that way)
  it('Autenticating on vtex cli', () => {
    // Authenticate as Robot
    // Try to load VTEX CLI callback URL
    cy.exec('cat .vtex.url', { timeout: 10000 }).then((callbackUrl) => {
      cy.visit(callbackUrl.stdout)
      // Intercept doesn't work, we must wait
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000)
      cy.get('body').then(($body) => {
        if ($body.find(TXT_EMAIL).length) {
          // Fill Robot email
          cy.get(TXT_EMAIL)
            .should('be.visible')
            .type(`${config.vtex.robotMail}{enter}`, { log: false })
          // Fill Robot password
          cy.get(TXT_PASSWORD)
            .should('be.visible')
            .type(`${config.vtex.robotPassword}{enter}`, { log: false })
        }
      })
      // Sometimes the system ask for SMS Code, we must wait
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000)
      // Fill Robot SMS code
      cy.get('body').then(($body) => {
        if ($body.find(TXT_CODE).length) {
          let sid = config.twilio.apiUser
          let token = config.twilio.apiToken
          let url = `${config.twilio.baseUrl}/${sid}/Messages.json?PageSize=5`
          // Get SMS Code
          cy.getTwilioOTP(url, sid, token, 5000).then((code) => {
            cy.get(TXT_CODE).should('be.visible').type(`${code}{enter}`)
          })
        }
      })
      // Wait for the authentication process to finish
      cy.get('body').should('contain', 'You may now close this window.')
    })
  })

  // Get Robot Cookie and saving it
  it('Getting robot cookie', () => {
    cy.vtex('whoami').its('stdout').should('contain', 'Logged into')
    cy.vtex('local token').then((cookie) => {
      cy.addConfig(stateFile, 'vtex', 'robotCookie', cookie.stdout)
    })
  })

  // Create a new workspace
  it(`Creating workspace ${config.workspace.name}`, () => {
    cy.vtex(`workspace use ${config.workspace.name}`)
      .its('stdout')
      .should('contain', config.workspace.name)
  })

  // Install B2B apps
  config.workspace.setup.install.forEach((app) => {
    it(`Installing ${app}`, APP_RETRIES, () => {
      cy.vtex(`install ${app}`)
        .its('stdout', FAIL_TIMEOUT)
        .should('contains', 'successfully')
    })
  })

  // Uninstall master's theme and the app to be linked
  config.workspace.setup.uninstall.push(APP_LINK)
  config.workspace.setup.uninstall.forEach((app) => {
    it(`Removing ${app}`, APP_RETRIES, () => {
      cy.vtex(`uninstall ${app}`)
        .its('stdout', FAIL_TIMEOUT)
        .should('contains', 'successfully')
    })
  })

  // Link app to test
  it.skip(`Linking ${APP_LINK}`, APP_RETRIES, () => {
    cy.vtex('unlink -a')
    cy.vtex('link')
  })

  it.skip(`Checking if ${APP_LINK} was linked`, APP_RETRIES, () => {
    cy.vtex('ls | grep Linked -A 3')
      .its('stdout', FAIL_TIMEOUT)
      .should('contains', APP_LINK)
  })

  it.skip('Set roles in organization JSON', { retries: 3 }, () => {
    cy.setCookie(vtex.COOKIE_NAME, vtex.API_COOKIE)

    const roles = OTHER_ROLES
    const APP_NAME = 'vtex.storefront-permissions'
    const APP_VERSION = '1.x'
    const APP = `${APP_NAME}@${APP_VERSION}`
    const CUSTOM_URL = `${
      Cypress.config().baseUrl
    }/_v/private/admin-graphql-ide/v0/${APP}`
    const GRAPHQL_LIST_ROLE_QUERY = 'query' + '{listRoles{id,name}}'

    cy.request({
      method: 'POST',
      url: CUSTOM_URL,
      body: {
        query: GRAPHQL_LIST_ROLE_QUERY,
      },
    }).then((response) => {
      const rolesObject = response.body.data.listRoles.filter((r) =>
        roles.includes(r.name)
      )
      expect(rolesObject.length).to.equal(3)
      rolesObject.map((r) => cy.setOrganizationItem(`${r.name}-id`, r.id))
    })
  })
})
