/// <reference types="cypress" />

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
      cy.addConfig(
        stateFile,
        'vtex',
        'authCookie',
        response.body.authCookie.Value
      )
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
      // Sometimes the system ask for SMS Code
      // You must wait do see if it is the case
      cy.wait(2000) // eslint-disable-line cypress/no-unnecessary-waiting
      // Fill Robot SMS code
      cy.get('body').then(($body) => {
        if ($body.find(TXT_CODE).length) {
          // Get SMS Code
          cy.pause()
          // const OTP = Cypress.env('OTP_SH')
          // cy.exec(OTP).then((smsCode) => {
          //   cy.get(TXT_CODE)
          //     .should('be.visible')
          //     .type(`${smsCode.stdout}{enter}`)
          // })
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

  // Sync of custom-ui rules
  it(
    'Syncing Custom-UI configuration',
    { retries: 9, responseTimeout: 5000, requestTimeout: 5000 },
    () => {
      // Define constants
      const APP_NAME = 'vtex.checkout-ui-custom'
      const APP_VERSION = '0.x'
      const APP = `${APP_NAME}@${APP_VERSION}`
      const CUSTOM_URL = `https://${config.vtex.account}.myvtex.com/_v/private/admin-graphql-ide/v0/${APP}`
      const GRAPHQL_QUERY =
        '{getLast(workspace: "master")' +
        '{email workspace layout javascript css javascriptActive cssActive colors}}'

      const GRAPHQL_MUTATION =
        'mutation' +
        '($email: String, $workspace: String, $layout: CustomFields, $javascript: String, $css: String, $javascriptActive: Boolean, $cssActive: Boolean, $colors: CustomFields)' +
        '{saveChanges(email: $email, workspace: $workspace, layout: $layout, javascript: $javascript, css: $css, javascriptActive: $javascriptActive, cssActive: $cssActive, colors: $colors)}'

      // Getting master values
      cy.request({
        method: 'POST',
        url: CUSTOM_URL,
        body: { query: GRAPHQL_QUERY },
      })
        .as('GRAPHQL')
        .its('status')
        .should('equal', 200)

      // Mutating it to the new workspace
      cy.get('@GRAPHQL').then((query) => {
        query.body.data.getLast.workspace = config.vtex.workspace
        cy.request({
          method: 'POST',
          url: CUSTOM_URL,
          body: {
            query: GRAPHQL_MUTATION,
            variables: query.body.data.getLast,
          },
        })
          .its('body.data.saveChanges')
          .should('contain', 'DocumentId')
      })
    }
  )
})
