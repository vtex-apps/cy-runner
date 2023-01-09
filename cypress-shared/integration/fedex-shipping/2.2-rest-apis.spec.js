/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import {
  loadDocks,
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase.js'
import { data } from '../../fixtures/fedex-shipping-fixtures/shippingRatePayload.json'

const prefix = 'Rest API'

describe('Rest-api-testcases', () => {
  loginViaCookies()

  loadDocks()

  it(`${prefix} - Calculate shipping price`, updateRetry(2), () => {
    loadCalculateShippingAPI(data, validateCalculateShipping)
  })

  preserveCookie()
})
