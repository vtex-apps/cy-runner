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

  cy.callRestAPIAndAddLogs({
    url: CUSTOM_URL,
    body: {
      query,
      variables: queryVariables,
    },
  }).as('RESPONSE')

  if (validateResponseFn) {
    cy.get('@RESPONSE').then((response) => {
      commonGraphlValidation(response)
      validateResponseFn(response, params)
    })
  } else {
    return cy.get('@RESPONSE')
  }
}
