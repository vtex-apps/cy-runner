import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from './constants.js'
import { updateRetry } from './support.js'
import { cancelOrderAPI } from './apis.js'

const config = Cypress.env()

// Constants
const { account } = config.base.vtex
const TAX_APP = config.workspace.prefix

export const ORDER_FORM_CONFIG = `https://${account}.vtexcommercestable.com.br/api/checkout/pvt/configuration/orderForm`

export function configureTargetWorkspace(app, version, workspace = 'master') {
  it(
    `Configuring target workspace as ${workspace} in ${app}`,
    updateRetry(2),
    () => {
      cy.getVtexItems().then((vtex) => {
        // Define constants
        const APP_NAME = 'vtex.apps-graphql'
        const APP_VERSION = '3.x'
        const APP = `${APP_NAME}@${APP_VERSION}`
        const CUSTOM_URL = `https://${vtex.account}.myvtex.com/_v/private/admin-graphql-ide/v0/${APP}`

        const GRAPHQL_MUTATION =
          'mutation' +
          '($app:String,$version:String,$settings:String)' +
          '{saveAppSettings(app:$app,version:$version,settings:$settings){message}}'

        const QUERY_VARIABLES = {
          app,
          version,
          settings: `{"targetWorkspace":"${workspace}"}`,
        }

        // Mutating it to the new workspace
        cy.request({
          method: 'POST',
          url: CUSTOM_URL,
          ...FAIL_ON_STATUS_CODE,
          body: {
            query: GRAPHQL_MUTATION,
            variables: QUERY_VARIABLES,
          },
        })
          .its('body.data.saveAppSettings.message', { timeout: 10000 })
          .should('contain', workspace)
      })
    }
  )
}

function callOrderFormConfiguration(vtex) {
  cy.request({
    method: 'GET',
    url: ORDER_FORM_CONFIG,
    headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
    ...FAIL_ON_STATUS_CODE,
  })
    .as('ORDERFORM')
    .its('status')
    .should('equal', 200)

  return cy.get('@ORDERFORM')
}

export function configureTaxConfigurationInOrderForm(workspace = null) {
  it(`Configuring tax configuration in Order Form Configuration API`, () => {
    cy.getVtexItems().then((vtex) => {
      callOrderFormConfiguration(vtex).then((response) => {
        response.body.taxConfiguration = workspace
          ? {
              url: `https://${workspace}--${vtex.account}.myvtex.com/${TAX_APP}/checkout/order-tax`,
              authorizationHeader: vtex.authorizationHeader,
              allowExecutionAfterErrors: false,
              integratedAuthentication: false,
              appId: null,
            }
          : {}
        cy.request({
          method: 'POST',
          url: ORDER_FORM_CONFIG,
          headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
          ...FAIL_ON_STATUS_CODE,
          body: response.body,
        })
          .its('status')
          .should('equal', 204)
      })
    })
  })
}

export function cancelTheOrder(orderEnv) {
  it(`Cancel the Order`, () => {
    cy.getVtexItems().then((vtex) => {
      cy.getOrderItems().then((order) => {
        cy.request({
          method: 'POST',
          url: cancelOrderAPI(vtex.baseUrl, order[orderEnv]),
          headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
          body: {
            reason: 'Customer bought it by mistake',
          },
        })
          .its('status')
          .should('equal', 200)
      })
    })
  })
}

export function startE2E(app, workspace) {
  it(`Start ${app}`, () => {
    cy.getVtexItems().then((vtex) => {
      callOrderFormConfiguration(vtex).then((response) => {
        const { taxConfiguration } = response.body

        if (!taxConfiguration) {
          expect(response.body.taxConfiguration).to.be.null
        } else {
          expect(response.body.taxConfiguration.url).to.include(workspace)
        }
      })
    })
  })
}
