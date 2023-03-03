import { FAIL_ON_STATUS_CODE } from './constants'

const config = Cypress.env()

// Constants
const { vtex } = config.base

export function commonGraphlValidation(response) {
  expect(response.status).to.equal(200)
  expect(response.body.data).to.not.equal(null)
  expect(response.body).to.not.equal('OK')
  expect(response.body).to.not.have.own.property('errors')
}

export function graphql(
  app,
  getQuery,
  validateResponseFn = null,
  params = null
) {
  const { query, queryVariables } = getQuery

  // Define constants
  const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${app}`

  // Note: Don't replace this cy.request with cy.callRestAPIAndAddLogs
  // We already adding graphql here
  cy.request({
    method: 'POST',
    url: CUSTOM_URL,
    body: {
      query,
      variables: queryVariables,
    },
    ...FAIL_ON_STATUS_CODE,
  }).as('RESPONSE')

  cy.addGraphqlLogs(query, queryVariables)

  if (validateResponseFn) {
    cy.get('@RESPONSE').then((response) => {
      commonGraphlValidation(response)
      validateResponseFn(response, params)
    })
  } else {
    return cy.get('@RESPONSE')
  }
}
