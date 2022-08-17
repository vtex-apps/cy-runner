import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER, ENTITIES } from './constants.js'
import { updateRetry } from './support.js'
import { cancelOrderAPI, affiliationAPI } from './apis.js'

const config = Cypress.env()
const WIPE_ENV = 'wipe'

// Constants
const {
  account,
  apiKey,
  apiToken,
  authorizationHeader,
  baseUrl,
  appKey,
  appToken,
  affiliationId,
  robotMail,
} = config.base.vtex

const TAX_APP = config.workspace.prefix
const WORKSPACE = config.workspace.name

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
        body.taxConfiguration
          ? body.taxConfiguration.url.includes(WORKSPACE)
          : null
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
  // This startE2E() is for tax App
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

        if (minutes >= 30) {
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

function verifyEnvs(paymentEnvs = false) {
  if (apiKey && apiToken) {
    if (paymentEnvs) {
      if (appKey && appToken && affiliationId) {
        cy.log('All envs are available in VTEX_QE.json')
      } else {
        cy.log('Some envs are missing in VTEX_QE.json')
      }
    }
  } else {
    cy.log('Some envs are missing in VTEX_QE.json')
  }
}

export function startPaymentE2ETests() {
  // If you are using this function in your testcase
  // then ensure, you are having affiliationId, apiKey and apiToken in .VTEX_QE.json
  it(`Start E2E with ${WORKSPACE}`, () => {
    verifyEnvs(true)
    cy.request({
      url: affiliationAPI(affiliationId),
      headers: VTEX_AUTH_HEADER(apiKey, apiToken),
      ...FAIL_ON_STATUS_CODE,
    }).then((response) => {
      const workspaceIndex = response.body.configuration.findIndex(
        (obj) => obj.name === 'workspace'
      )

      const workspaceInGatewayAffialitions =
        response.body.configuration[workspaceIndex].value

      if (!['', WORKSPACE].includes(workspaceInGatewayAffialitions)) {
        throw new Error(
          `Another test is running with workspace ${workspaceInGatewayAffialitions}. Please, try again later.\n`
        )
      } else {
        cy.log('Starting E2E configuration')
      }
    })
  })
}

export const AUTO_SETTLEMENT_OPTIONS = {
  enable: 'after_antifraud',
  disable: 'disabled',
}

export function setWorkspaceAndGatewayAffiliations({
  autoSellement = true,
  wipe = false,
} = {}) {
  // If you are using this function in your testcase
  // then ensure, you are having affiliationId, apiKey,apiToken,appKey and appToken in .VTEX_QE.json

  const autoSellementValue = autoSellement
    ? AUTO_SETTLEMENT_OPTIONS.enable
    : AUTO_SETTLEMENT_OPTIONS.disable

  const workspace = wipe ? '' : WORKSPACE

  it(
    `Setting workspace value as "${workspace}" with payment capture ${autoSellementValue}`,
    updateRetry(3),
    () => {
      cy.request({
        url: affiliationAPI(affiliationId),
        headers: VTEX_AUTH_HEADER(apiKey, apiToken),
        ...FAIL_ON_STATUS_CODE,
      }).then((response) => {
        const { configuration } = response.body
        const workspaceIndex = configuration.findIndex(
          (obj) => obj.name === 'workspace'
        )

        const autoSettleIndex = configuration.findIndex(
          (obj) => obj.name === 'autoSettle'
        )

        const appKeyIndex = configuration.findIndex(
          (obj) => obj.name === 'appKey'
        )

        const appTokenIndex = configuration.findIndex(
          (obj) => obj.name === 'appToken'
        )

        response.body.configuration[workspaceIndex].value = workspace
        response.body.configuration[autoSettleIndex].value = autoSellementValue
        response.body.configuration[appKeyIndex].value = appKey
        response.body.configuration[appTokenIndex].value = appToken

        cy.request({
          method: 'PUT',
          url: affiliationAPI(affiliationId),
          headers: VTEX_AUTH_HEADER(apiKey, apiToken),
          body: response.body,
          ...FAIL_ON_STATUS_CODE,
        })
          .its('status')
          .should('equal', 201)
      })
    }
  )
}

export function syncCheckoutUICustom() {
  // eslint-disable-next-line jest/expect-expect
  it('Sync Checkout UI Custom', updateRetry(2), () => {
    cy.visit('admin/app/vtex-checkout-ui-custom/')
    cy.contains('Publish', { timeout: 25000 }).should('be.visible').click()
    cy.contains('History', { timeout: 35000 }).should('be.visible').click()
    cy.contains(WORKSPACE, { timeout: 15000 }).should('be.visible')
  })
}

export function deleteAddresses() {
  it('Getting user & then deleting addresses associated with that user', () => {
    cy.searchInMasterData(ENTITIES.CLIENTS, robotMail).then((clients) => {
      cy.searchInMasterData(ENTITIES.ADDRESSES, clients[0].id).then(
        (addresses) => {
          for (const { id } of addresses) {
            cy.deleteDocumentInMasterData(ENTITIES.ADDRESSES, id)
          }
        }
      )
    })
  })
}
