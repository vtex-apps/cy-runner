import { FAIL_ON_STATUS_CODE } from '../common/constants'
import { updateRetry } from '../common/support'

const version = '*.x'
const app = 'vtex.shopper-location'

export function updateSettings(
  country,
  url,
  { automaticRedirect = false } = {}
) {
  it(
    `Configuring ${
      automaticRedirect ? 'automatic' : ''
    } redirect with country ${country} in ${app}`,
    updateRetry(2),
    () => {
      cy.getVtexItems().then((vtex) => {
        // Define constants
        const APP_NAME = 'vtex.apps-graphql'
        const APP_VERSION = '3.x'
        const APP = `${APP_NAME}@${APP_VERSION}`
        const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`
        const GRAPHQL_MUTATION =
          'mutation' +
          '($app:String,$version:String,$settings:String)' +
          '{saveAppSettings(app:$app,version:$version,settings:$settings){message}}'
        cy.log("save settings via saveAppSettings graphQl mutation")
        const QUERY_VARIABLES = {
          app,
          version,
          settings: `{"automaticRedirect":${automaticRedirect},"redirects":[{"country":"${country}","url":"${url}"}]}`,
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
  )
}
