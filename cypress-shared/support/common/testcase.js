import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from './constants.js'
import { updateRetry } from './support.js'
import { cancelOrderAPI } from './apis.js'

const config = Cypress.env()
const WIPE_ENV = 'wipe'

// Constants
const { account, apiKey, apiToken, authorizationHeader, baseUrl } =
  config.base.vtex

const TAX_APP = config.workspace.prefix
const { name } = config.workspace

export const ORDER_FORM_CONFIG = `https://${account}.vtexcommercestable.com.br/api/checkout/pvt/configuration/orderForm`

export function configureTargetWorkspace(app, version, workspace = 'master') {
  it(
    `Configuring target workspace as ${workspace} in ${app}`,
    updateRetry(2),
    () => {
      cy.getOrderItems().then((order) => {
        if (order[WIPE_ENV]) {
          // Define constants
          const APP_NAME = 'vtex.apps-graphql'
          const APP_VERSION = '3.x'
          const APP = `${APP_NAME}@${APP_VERSION}`
          const CUSTOM_URL = `https://${account}.myvtex.com/_v/private/admin-graphql-ide/v0/${APP}`

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
        } else {
          cy.log('Tax configuration is configured with another workspace')
        }
      })
    }
  )
}

function callOrderFormConfiguration() {
  cy.request({
    method: 'GET',
    url: ORDER_FORM_CONFIG,
    headers: VTEX_AUTH_HEADER(apiKey, apiToken),
    ...FAIL_ON_STATUS_CODE,
  })
    .as('ORDERFORM')
    .its('status')
    .should('equal', 200)

  return cy.get('@ORDERFORM')
}

function makeDecision(workspace) {
  if (!workspace) {
    // If workspace is null then we are on wipe step
    callOrderFormConfiguration().then(({ body }) => {
      // if we have workspace name in taxConfiguration then return true else null
      cy.setOrderItem(
        WIPE_ENV,
        body.taxConfiguration ? body.taxConfiguration.url.includes(name) : null
      )
    })
  } else {
    // if workspace is not null then we are on postSetup step
    cy.log('Setting workspace in taxConfiguration')
    cy.setOrderItem(WIPE_ENV, true)
  }
}

export function configureTaxConfigurationInOrderForm(workspace = null) {
  it(`Configuring tax configuration in Order Form Configuration API`, () => {
    makeDecision(workspace)
    cy.getOrderItems().then((order) => {
      if (order[WIPE_ENV]) {
        callOrderFormConfiguration().then((response) => {
          response.body.taxConfiguration = workspace
            ? {
                url: `https://${workspace}--${account}.myvtex.com/${TAX_APP}/checkout/order-tax`,
                authorizationHeader,
                allowExecutionAfterErrors: false,
                integratedAuthentication: false,
                appId: new Date(),
              }
            : {}
          cy.request({
            method: 'POST',
            url: ORDER_FORM_CONFIG,
            headers: VTEX_AUTH_HEADER(apiKey, apiToken),
            ...FAIL_ON_STATUS_CODE,
            body: response.body,
          })
            .its('status')
            .should('equal', 204)
        })
      } else {
        cy.setOrderItem(WIPE_ENV, false)
        cy.log('Tax configuration is configured with another workspace')
      }
    })
  })
}

export function cancelTheOrder(orderEnv) {
  it(`Cancel the Order`, () => {
    cy.getOrderItems().then((order) => {
      cy.request({
        method: 'POST',
        url: cancelOrderAPI(baseUrl, order[orderEnv]),
        headers: VTEX_AUTH_HEADER(apiKey, apiToken),
        body: {
          reason: 'Customer bought it by mistake',
        },
      })
        .its('status')
        .should('equal', 200)
    })
  })
}

export function startE2E(app, workspace) {
  it(`Start ${app}`, () => {
    callOrderFormConfiguration().then((response) => {
      const { taxConfiguration } = response.body

      if (!taxConfiguration) {
        expect(response.body.taxConfiguration).to.be.null
      } else {
        const { appId, url } = response.body.taxConfiguration
        const minutes = parseInt(
          (Math.abs(new Date().getTime() - new Date(appId).getTime()) /
            (1000 * 60)) %
            60,
          10
        )

        // if the workspace was blocked longer than 30 minutes then
        // skip validation & force update taxConfiguration

        if (minutes === 30) {
          const [WORKSPACE_IN_TAX_CONFIG] = url.split('//')[1].split('--')

          cy.log(
            `TaxConfiguration is used by this workspace ${WORKSPACE_IN_TAX_CONFIG} for more than or equal to 30 minutes`
          )
        } else {
          expect(url).to.include(workspace)
        }
      }
    })
  })
}
