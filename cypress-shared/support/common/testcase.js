import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER, ENTITIES } from './constants.js'
import { updateRetry } from './support.js'
import {
  cancelOrderAPI,
  affiliationAPI,
  invoiceAPI,
  transactionAPI,
} from './apis.js'
import { isValidDate } from './utils.js'

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
  urlExternalSeller,
} = config.base.vtex

const { prefix } = config.workspace
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
                url: `https://${workspace}--${account}.myvtex.com/${prefix}/checkout/order-tax`,
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
        ...FAIL_ON_STATUS_CODE,
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
  // eg: Avalara, Cybersource, Digital River
  it(`Start ${app} E2E tests with this ${workspace}`, () => {
    callOrderFormConfiguration().then((response) => {
      const { taxConfiguration } = response.body

      if (!taxConfiguration) {
        expect(response.body.taxConfiguration).to.be.null
      } else {
        const { appId, url } = response.body.taxConfiguration
        const validDate = isValidDate(new Date(appId))

        if (validDate) {
          const minutes = Math.abs(
            // 1 minute = 60000 milliseconds
            parseInt((new Date() - new Date(appId)) / 60000, 10)
          )

          // if the workspace was blocked longer than 30 minutes then
          // skip validation & force update taxConfiguration

          if (minutes >= 30) {
            const [WORKSPACE_IN_TAX_CONFIG] = url.split('//')[1].split('--')

            cy.log(
              `TaxConfiguration is used by this workspace ${WORKSPACE_IN_TAX_CONFIG} for more than or equal to 30 minutes i.e for ${minutes} minutes`
            )
          } else {
            expect(url).to.include(workspace)
          }
        } else {
          cy.log('appId is having invalid Date!')
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
  it(`Start ${prefix} E2E tests with this workspace ${WORKSPACE}`, () => {
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
    `In ${prefix} - Setting workspace value as "${workspace}" with payment capture ${autoSellementValue}`,
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
  it(`In ${prefix} - Sync Checkout UI Custom`, updateRetry(2), () => {
    cy.visit('admin/app/vtex-checkout-ui-custom/')
    cy.contains('Publish', { timeout: 25000 }).should('be.visible').click()
    cy.getVtexItems().then((vtex) => {
      cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
        if (req.body.operationName === 'GetHistory') {
          req.continue()
        }
      }).as('GetHistory')
    })
    cy.contains('History', { timeout: 35000 }).should('be.visible').click()
    cy.contains(WORKSPACE, { timeout: 15000 }).should('be.visible')
    cy.wait('@GetHistory')
  })
}

export function syncCheckoutUICustomAPI() {
  // eslint-disable-next-line jest/expect-expect
  it(
    `In ${prefix} - Sync Checkout UI Custom via API`,
    { retries: 9, responseTimeout: 5000, requestTimeout: 5000 },
    () => {
      cy.getVtexItems().then((vtex) => {
        // Define constants
        const APP_NAME = 'vtex.checkout-ui-custom'
        const APP_VERSION = '0.x'
        const APP = `${APP_NAME}@${APP_VERSION}`
        const CUSTOM_URL = `https://${vtex.account}.myvtex.com/_v/private/admin-graphql-ide/v0/${APP}`
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
          query.body.data.getLast.workspace = WORKSPACE

          cy.request({
            method: 'POST',
            url: CUSTOM_URL,
            body: {
              query: GRAPHQL_MUTATION,
              variables: query.body.data.getLast,
            },
          })
            .its('body.data.saveChanges', { timeout: 5000 })
            .should('contain', 'DocumentId')
        })
      })
    }
  )
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

/*
Below fn operates with getTestVariables
*/

export function getTestVariables(testCasePrefix) {
  return {
    orderIdEnv: testCasePrefix,
    transactionIdEnv: `${testCasePrefix}-transactionIdEnv`,
    paymentTidEnv: `${testCasePrefix}-paymentTidEnv`,
    productTotalEnv: `${testCasePrefix}-productTotalEnv`,
  }
}

export function sendInvoiceTestCase({
  product,
  orderIdEnv,
  externalSellerTestcase = false,
}) {
  let total

  it(`In ${product.prefix} - Send Invoice`, () => {
    cy.getOrderItems().then((item) => {
      if (externalSellerTestcase) {
        if (product.directSaleEnv === orderIdEnv) {
          total = product.directSaleAmount
        } else {
          total = product.externalSellerAmount
        }
      }
      // If this is not externalSellerTestCase then it is for refund test case
      else {
        total =
          product.totalWithoutTax || product.total || product.totalProductPrice
      }

      cy.sendInvoiceAPI(
        {
          invoiceNumber: '54321',
          invoiceValue: total
            .replace('$ ', '')
            .replace(/\./, '')
            .replace(/,/, ''),
          invoiceUrl: null,
          issuanceDate: new Date(),
          invoiceKey: null,
        },
        item[orderIdEnv],
        orderIdEnv === product.externalSaleEnv
      ).then((response) => {
        expect(response.status).to.equal(200)
      })
    })
  })
}

function generateInvoiceAPIURL(product, item, env) {
  return env === product.externalSaleEnv
    ? `${invoiceAPI(urlExternalSeller)}/QSS-${item[env]}`
    : `${invoiceAPI(baseUrl)}/${item[env]}`
}

export function invoiceAPITestCase({
  product,
  env,
  transactionIdEnv,
  pickup = false,
}) {
  it(
    `In ${product.prefix} -Invoice API should have expected information`,
    updateRetry(2),
    () => {
      cy.getOrderItems().then((item) => {
        cy.getAPI(
          generateInvoiceAPIURL(product, item, env),
          VTEX_AUTH_HEADER(apiKey, apiToken)
        ).then((response) => {
          expect(response.status).to.equal(200)
          const postalCode = pickup
            ? product.pickUpPostalCode
            : product.postalCode

          expect(response.body.shippingData.address.postalCode).to.equal(
            postalCode
          )
          // Setting Transaction Id in .orders.json
          cy.setOrderItem(
            transactionIdEnv,
            response.body.paymentData.transactions[0].transactionId
          )
        })
      })
    }
  )
}

function checkTransactionIdIsAvailable(transactionIdEnv) {
  if (!transactionIdEnv) {
    throw new Error('Transaction Id is undefined')
  }
}

export function verifyTransactionPaymentsAPITestCase(
  product,
  { transactionIdEnv, paymentTidEnv },
  fn = null
) {
  it(
    `In ${product.prefix} - Verify Transaction Payment`,
    updateRetry(2),
    () => {
      cy.addDelayBetweenRetries(2000)
      cy.getVtexItems().then((vtex) => {
        cy.getOrderItems().then((order) => {
          checkTransactionIdIsAvailable(order[transactionIdEnv])
          cy.getAPI(
            `${transactionAPI(vtex.baseUrl)}/${
              order[transactionIdEnv]
            }/payments`,
            VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken)
          ).then((response) => {
            expect(response.status).to.equal(200)
            // Store payment tid in .orders.json
            cy.setOrderItem(paymentTidEnv, response.body[0].tid)
            fn && fn(response)
          })
        })
      })
    }
  )
}
