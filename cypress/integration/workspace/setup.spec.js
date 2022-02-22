/// <reference types="cypress" />
// import Twilio from '../../conductor/twilio'
// const twilio = new Twilio()

// Get config
let config = Cypress.env()
let stateFile = config.workspace.stateFiles[0]

// Login page model
const TXT_EMAIL = '[name = "email"]'
const TXT_PASSWORD = '[name = "password"]'
const TXT_CODE = '[name = "code"]'

describe('Setting up the environment', () => {
  // Test if VTEX CLI is installed doing a logout
  it('Checking VTEX CLI', () => {
    cy.vtex('logout').its('stdout').should('contain', 'See you soon')
  })

  // Get Cookie Credential
  it('Getting Admin auth cookie value', () => {
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
  it('Autenticating on VTEX CLI', () => {
    // Authenticate as Robot
    // Try to load VTEX CLI callback URL
    cy.exec('cat .vtex.url', { timeout: 10000 }).then((callbackUrl) => {
      cy.visit(callbackUrl.stdout)
      // Intercept doesn't work, you must wait two seconds
      cy.wait(2000) // eslint-disable-line cypress/no-unnecessary-waiting
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
      // Sometimes the system ask for SMS Code, we must wait do see if it is the case
      cy.wait(2000) // eslint-disable-line cypress/no-unnecessary-waiting
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
  it('Getting Robot cookie value', () => {
    cy.vtex('whoami').its('stdout').should('contain', 'Logged into')
    cy.vtex('local token').then((cookie) => {
      cy.addConfig(stateFile, 'vtex', 'robotCookie', cookie.stdout)
    })
  })

  // Create a new workspace
  it(`Creating the workspace ${config.workspace.name}`, () => {
    cy.vtex(`workspace use ${config.workspace.name}`)
      .its('stdout')
      .should('contain', config.workspace.name)
  })

  // Install B2B apps
  config.workspace.setup.install.forEach((app) => {
    it(`Installing APP ${app}`, () => {
      cy.vtex(`install ${app}`).its('stdout').should('contains', 'successfully')
    })
  })

  // Uninstall master's theme
  config.workspace.setup.uninstall.forEach((app) => {
    it(`Removing APP ${app}`, () => {
      cy.vtex(`uninstall ${app}`)
        .its('stdout')
        .should('contains', 'successfully')
    })
  })

  it.skip('Set roles in organization JSON', { retries: 3 }, () => {
    cy.setCookie(config.vtex.authCookieName, config.vtex.authCookieValue)

    const roles = Object.keys(ROLE_ID_EMAIL_MAPPING)
    const APP_NAME = 'vtex.storefront-permissions'
    const APP_VERSION = '1.x'
    const APP = `${APP_NAME}@${APP_VERSION}`

    cy.getVtexItems().then((vtex) => {
      const CUSTOM_URL = `https://${vtex.WORKSPACE}--${vtex.ACCOUNT}.myvtex.com/_v/private/admin-graphql-ide/v0/${APP}`
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
})
