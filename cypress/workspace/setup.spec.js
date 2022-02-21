/// <reference types="cypress" />

// Login page model
const TXT_EMAIL = '[name = "email"]'
const TXT_PASSWORD = '[name = "password"]'
const TXT_CODE = '[name = "code"]'

describe('Setting up the environment', () => {
  const WORKSPACE = Cypress.env('WORKSPACE')

  // Test if VTEX CLI is installed doing a logout
  it('Checking VTEX CLI', () => {
    cy.vtex('logout').its('stdout').should('contain', 'See you soon')
  })

  // Set variables to be used in all next tests
  it('Setting global variables', () => {
    cy.setVtexItem('WORKSPACE', WORKSPACE)
    cy.setVtexItem('ACCOUNT', Cypress.env('VTEX_ACCOUNT'))
    cy.setVtexItem(
      'BASE_URL',
      `https://${WORKSPACE}--${Cypress.env('VTEX_ACCOUNT')}.myvtex.com`
    )
    cy.setVtexItem('ROBOT_MAIL', Cypress.env('VTEX_ROBOT_MAIL'))
    cy.setVtexItem('ROBOT_PASSWORD', Cypress.env('VTEX_ROBOT_PASSWORD'))
    cy.setVtexItem('API_KEY', Cypress.env('VTEX_API_KEY'))
    cy.setVtexItem('API_TOKEN', Cypress.env('VTEX_API_TOKEN'))
    cy.setVtexItem('PLATFORM_URL', 'https://platform.io.vtex.com')
    cy.setVtexItem(
      'ID_URL',
      'https://vtexid.vtex.com.br/api/vtexid/pub/authenticate/default'
    )
    cy.setVtexItem('COOKIE_NAME', Cypress.env('VTEX_COOKIE_NAME'))
    cy.setVtexItem('ACCOUNT_ID', Cypress.env('VTEX_ACCOUNT_ID'))
    cy.setVtexItem('AUTHORIZATION', Cypress.env('VTEX_AUTHORIZATION'))
    cy.setVtexItem(
      'AVALARA_AUTHORIZATION',
      `Basic ${Cypress.env('VTEX_AVALARA_AUTHORIZATION')}`
    )
    cy.setVtexItem('EXTERNAL_SELLER_ID', 'QSS')
    cy.setVtexItem(
      'EXTERNAL_SELLER_URL',
      Cypress.env('VTEX_EXTERNAL_SELLER_URL')
    )
    cy.setVtexItem(
      'ORDER_FORM_CONFIG',
      `https://${Cypress.env(
        'VTEX_ACCOUNT'
      )}.vtexcommercestable.com.br/api/checkout/pvt/configuration/orderForm`
    )
  })

  // Get Cookie Credential
  it('Getting Admin auth cookie value', () => {
    // Get Cookie Credencial
    cy.getVtexItems().then((vtex) => {
      cy.request({
        method: 'GET',
        url: vtex.ID_URL,
        qs: { user: vtex.API_KEY, pass: vtex.API_TOKEN },
      }).then((response) => {
        expect(response.body).property('authStatus').to.equal('Success')
        cy.setVtexItem('API_COOKIE', response.body.authCookie.Value)
        cy.setVtexItem(
          'AUTH_URL',
          `https://${vtex.ACCOUNT}.myvtex.com/api/vtexid/pub/authentication`
        )
      })
    })
  })

  // Start VTEX CLI Authentication (the VTEX CLI is a version modified to work that way)
  it('Autenticating on VTEX CLI', () => {
    // Authenticate as Robot
    cy.getVtexItems().then((vtex) => {
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
              .type(`${vtex.ROBOT_MAIL}{enter}`, { log: false })
            // Fill Robot password
            cy.get(TXT_PASSWORD)
              .should('be.visible')
              .type(`${vtex.ROBOT_PASSWORD}{enter}`, { log: false })
          }
        })
        // Sometimes the system ask for SMS Code
        // You must wait do see if it is the case
        cy.wait(2000) // eslint-disable-line cypress/no-unnecessary-waiting
        // Fill Robot SMS code
        cy.get('body').then(($body) => {
          if ($body.find(TXT_CODE).length) {
            // Get SMS Code
            const OTP = Cypress.env('OTP_SH')
            cy.exec(OTP).then((smsCode) => {
              cy.get(TXT_CODE)
                .should('be.visible')
                .type(`${smsCode.stdout}{enter}`)
            })
          }
        })
      })

      // Wait for the authentication process to finish
      cy.get('body').should('contain', 'You may now close this window.')
    })
  })

  // Get Robot Cookie and saving it
  it('Getting Robot cookie value', () => {
    cy.vtex('whoami').its('stdout').should('contain', 'Logged into')
    cy.vtex('local token').then((cookie) => {
      cy.setVtexItem('ROBOT_COOKIE', cookie.stdout)
    })
  })

  // Create a new workspace
  it(`Creating the workspace ${WORKSPACE}`, () => {
    cy.getVtexItems().then((vtex) => {
      cy.vtex(`workspace use ${vtex.WORKSPACE}`)
        .its('stdout')
        .should('contain', vtex.WORKSPACE)
    })
  })

  // Link APP to test, Avalara in this case
  it('Linking App to be tested', { retries: 2 }, () => {
    cy.vtex('unlink -a')
    cy.vtex('link')
  })

  it('Checking if Avalara was linked', { retries: 2 }, () => {
    cy.vtex('ls | grep Linked -A 3').its('stdout').should('contains', 'avalara')
  })

  // Configure tax configuration in order form API
  configureTaxConfigurationInOrderForm(WORKSPACE)

  // Configure Target workspace in ordersBroadcast application
  configureTargetWorkspace(
    ordersBroadcast.app,
    ordersBroadcast.version,
    WORKSPACE
  )

  // Configure Target workspace in sno application
  configureTargetWorkspace(sno.app, sno.version, WORKSPACE)

  // Sync of custom-ui rules
  it(
    'Syncing Custom-UI configuration',
    { retries: 9, responseTimeout: 5000, requestTimeout: 5000 },
    () => {
      cy.getVtexItems().then((vtex) => {
        // Define constants
        const APP_NAME = 'vtex.checkout-ui-custom'
        const APP_VERSION = '0.x'
        const APP = `${APP_NAME}@${APP_VERSION}`
        const CUSTOM_URL = `https://${vtex.ACCOUNT}.myvtex.com/_v/private/admin-graphql-ide/v0/${APP}`
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
          query.body.data.getLast.workspace = vtex.WORKSPACE
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
      })
    }
  )
})

// Fail all if any test fails
stopTestCaseOnFailure()

/*  Verstions used on tests design

    Installed Apps
    vtex.admin-graphql-ide     3.6.0
    vtex.admin-search          1.50.2
    vtex.avalara               3.0.1
    vtex.checkout-ui-custom    0.6.6
    vtex.reviews-and-ratings   2.12.5
    vtex.search-resolver       1.59.1
    vtex.store-theme           4.4.2
    vtex.tax-fallback          0.0.4

*/
