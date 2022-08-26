/* eslint-disable jest/expect-expect */

import { FAIL_ON_STATUS_CODE } from '../common/constants'

const config = Cypress.env()

// Constants
const { vtex } = config.base

function commonGraphlValidation(response) {
  expect(response.status).to.equal(200)
  expect(response.body.data).to.not.equal(null)
  expect(response.body).to.not.have.own.property('errors')
}

export function graphql(getQuery, validateResponseFn = null) {
  const { query, queryVariables } = getQuery

  // Define constants
  const APP_NAME = 'vtex.affirm-payment'
  const APP = `${APP_NAME}@2.x`
  const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`

  cy.request({
    method: 'POST',
    url: CUSTOM_URL,
    ...FAIL_ON_STATUS_CODE,
    body: {
      query,
      variables: queryVariables,
    },
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

export function version() {
  return {
    query: 'query' + '{version}',
    queryVariables: {},
  }
}

export function affirmSettings() {
  return {
    query:
      'query' +
      '{affirmSettings{isLive,enableKatapult,companyName,publicApiKey}}',
    queryVariables: {},
  }
}

export function orderData() {
  return {
    query: 'query' + '{orderData{reference}}',
    queryVariables: {},
  }
}

export function orderUpdate(orderInfo) {
  const query =
    'mutation' +
    '($inboundUrl: String, $orderId: String, $callbackUrl: String)' +
    '{orderUpdate(inboundUrl: $inboundUrl, orderId: $orderId, callbackUrl: $callbackUrl)}'

  return {
    query,
    queryVariables: orderInfo,
  }
}

export function validateGetVersionResponse(response) {
  expect(response.body.data).to.not.equal(null)
}

export function validateAffirmSettingsResponse(response) {
  expect(response.body.data).to.not.equal(null)
}

export function validateOrderDataResponse(response) {
  expect(response.body.data).to.not.equal(null)
}

export function validateOrderUpdateResponse(response) {
  expect(response.body.data).to.not.equal(null)
}
