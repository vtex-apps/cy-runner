import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from './common_constants.js'
import { updateRetry } from './common_support.js'

export function configureTargetWorkspace(app, version, workspace = 'master') {
  it(
    `Configure target workspace as ${workspace} in ${app}`,
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

export function configureWorkspaceInOrderForm(workspace = 'master') {
  it(`Configure workspace as ${workspace} in Order Configuration API`, () => {
    const URL_REGEX = /(.*)--/

    cy.getVtexItems().then((vtex) => {
      cy.request({
        method: 'GET',
        url: vtex.orderFormConfig,
        headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
        ...FAIL_ON_STATUS_CODE,
      })
        .as('ORDERFORM')
        .its('status')
        .should('equal', 200)

      cy.get('@ORDERFORM').then((response) => {
        cy.log(JSON.stringify(response))
        const taxConfigurationUrl = response.body.taxConfiguration.url

        response.body.taxConfiguration.url = taxConfigurationUrl.replace(
          URL_REGEX,
          `https://${workspace}--`
        )
        cy.request({
          method: 'POST',
          url: vtex.orderFormConfig,
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
