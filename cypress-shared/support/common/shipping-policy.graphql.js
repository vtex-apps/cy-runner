const config = Cypress.env()

// Constants
const { vtex } = config.base

function commonGraphlValidation(response) {
  expect(response.status).to.equal(200)
  expect(response.body.data).to.not.equal(null)
  expect(response.body).to.not.equal('OK')
  expect(response.body).to.not.have.own.property('errors')
}

export function graphql(getQuery, validateResponseFn = null) {
  const { query, queryVariables } = getQuery

  const APP = 'vtex.logistics-carrier-graphql'
  const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`

  cy.callGraphqlAndAddLogs({
    url: CUSTOM_URL,
    query,
    variables: queryVariables,
  }).as('RESPONSE')

  if (validateResponseFn) {
    cy.get('@RESPONSE').then((response) => {
      commonGraphlValidation(response)
      validateResponseFn(response)
    })
  } else {
    return cy.get('@RESPONSE')
  }
}

export function updateShippingPolicy(data, { status = true, pickup = true }) {
  data.shippingPolicy.isActive = status
  data.shippingPolicy.deliveryChannel = pickup ? 'pickup-in-point' : 'delivery'
  const query =
    'mutation' +
    '( $shippingPolicy: ShippingPolicyInput!)' +
    '{updateShippingPolicy(shippingPolicy:$shippingPolicy){id, name}}'

  return {
    query,
    queryVariables: data,
  }
}
