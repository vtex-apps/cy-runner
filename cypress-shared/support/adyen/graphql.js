import { FAIL_ON_STATUS_CODE } from '../common/constants'
import { updateRetry } from '../common/support'

const config = Cypress.env()

// Constants
const { vtex } = config.base

export function updateAdyenConnectorSettings({
  merchantAccount = vtex.merchantAccount,
  apiKey = vtex.adyenApiKey,
  productionAPI = vtex.adyenProductionAPI,
  webhookUsername = vtex.adyenWebhookUsername,
  webhookPassword = vtex.adyenWebhookPassword,
  useAdyenPlatforms = true,
}) {
  it(`Configuring connector adyen`, updateRetry(2), () => {
    const version = '*.x'
    const app = 'vtex.connector-adyen'
    // Define constants
    const APP_NAME = 'vtex.apps-graphql'
    const APP_VERSION = '3.x'
    const APP = `${APP_NAME}@${APP_VERSION}`
    const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`
    const GRAPHQL_MUTATION =
      'mutation' +
      '($app:String,$version:String,$settings:String)' +
      '{saveAppSettings(app:$app,version:$version,settings:$settings){message}}'

    cy.log(
      `{"merchantAccount":${merchantAccount}, "apiKey" : ${apiKey}, "productionAPI": ${productionAPI}, "webhookUsername":${webhookUsername}, "webhookPassword": ${webhookPassword}, "useAdyenPlatforms":${useAdyenPlatforms}, "vtexAppKey": ${vtex.apiKey}, "vtexAppToken": ${vtex.apiToken}}`
    )
    const QUERY_VARIABLES = {
      app,
      version,
      settings: JSON.stringify({
        merchantAccount,
        apiKey,
        productionAPI,
        webhookUsername,
        webhookPassword,
        useAdyenPlatforms,
        vtexAppKey: vtex.apiKey,
        vtexAppToken: vtex.apiToken,
      }),
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
    }).its('body.data.saveAppSettings.message', { timeout: 10000 })
  })
}

export function updateAdyenPlatformSettings({
  apiKey = 'AQEmhmfuXNWTK0Qc+iSDhmEuouq5R5xIAzvm2vHcSangnOYX0q2Z90wQwV1bDb7kfNy1WIxIIkxgBw==-ThKfZoywEinJQfpndwjkGrW4eMQilzlabwMZx7Ieyv0=-[#e[wr87Vqu*hdM9',
  productionAPI = 'http://checkout-test.adyen.com',
}) {
  it(`Configuring connector adyen`, updateRetry(2), () => {
    // Define constants
    const version = '*.x'
    const app = 'vtex.adyen-platforms'
    const APP_NAME = 'vtex.apps-graphql'
    const APP_VERSION = '3.x'
    const APP = `${APP_NAME}@${APP_VERSION}`
    const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`
    const GRAPHQL_MUTATION =
      'mutation' +
      '($app:String,$version:String,$settings:String)' +
      '{saveAppSettings(app:$app,version:$version,settings:$settings){message}}'

    const QUERY_VARIABLES = {
      app,
      version,
      settings: JSON.stringify({
        apiKey,
        productionAPI,
      }),
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
    }).its('body.data.saveAppSettings.message', { timeout: 10000 })
  })
}
