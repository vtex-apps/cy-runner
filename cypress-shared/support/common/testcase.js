import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from './constants.js'
import { updateRetry } from './support.js'
import { cancelOrderAPI } from './apis.js'

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
        const CUSTOM_URL = `https://${vtex.ACCOUNT}.myvtex.com/_v/private/admin-graphql-ide/v0/${APP}`

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
          .its('body.data.saveAppSettings.message')
          .should('contain', workspace)
      })
    }
  )
}

export function configureTaxConfigurationInOrderForm(workspace = null) {
  it(`Configuring tax configuration in Order Form Configuration API`, () => {
    cy.getVtexItems().then((vtex) => {
      cy.request({
        method: 'GET',
        url: vtex.ORDER_FORM_CONFIG,
        headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
        ...FAIL_ON_STATUS_CODE,
      })
        .as('ORDERFORM')
        .its('status')
        .should('equal', 200)

      cy.get('@ORDERFORM').then((response) => {
        response.body.taxConfiguration = workspace
          ? {
              url: `https://${workspace}--${vtex.ACCOUNT}.myvtex.com/avalara/checkout/order-tax`,
              authorizationHeader: vtex.AUTHORIZATION,
              allowExecutionAfterErrors: false,
              integratedAuthentication: false,
              appId: null,
            }
          : {}
        cy.request({
          method: 'POST',
          url: vtex.ORDER_FORM_CONFIG,
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
