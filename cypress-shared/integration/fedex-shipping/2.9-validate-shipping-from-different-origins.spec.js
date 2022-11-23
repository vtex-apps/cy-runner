import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import { data } from '../../fixtures/shippingRatePayload.json'
import {
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase.js'

describe('Validate Ship Rates API from different origins', () => {
  loginViaCookies()

  it(
    'For Non Supported Country - eg: Poland should get response with status code 500',
    updateRetry(5),
    () => {
      cy.addDelayBetweenRetries(3000)
      data.destination = {
        zipCode: '00-005',
        country: 'PL',
        state: null,
        city: null,
        coordinates: null,
        residential: false,
      }
      loadCalculateShippingAPI(data).then((response) => {
        expect(response.status).to.have.equal(404)
      })
    }
  )

  it(
    'Use Shipment from Italy to USA(Supported country) ( Origin -> destination = ITA -> USA)',
    updateRetry(5),
    () => {
      cy.addDelayBetweenRetries(10000)
      data.destination = {
        zipCode: '33301',
        country: 'USA',
        state: null,
        city: null,
        coordinates: null,
        residential: false,
      }
      data.origin = {
        zipCode: '06010',
        country: 'ITA',
        state: null,
        city: null,
        coordinates: null,
        residential: false,
      }
      loadCalculateShippingAPI(data, validateCalculateShipping)
    }
  )

  it(
    'Use Shipment From USA(Supported country) to Italy ( Origin -> destination = USA -> ITA)',
    updateRetry(5),
    () => {
      cy.addDelayBetweenRetries(10000)
      data.destination = {
        zipCode: '06010',
        country: 'ITA',
        state: null,
        city: null,
        coordinates: null,
        residential: false,
      }
      data.origin = {
        zipCode: '33301',
        country: 'USA',
        state: null,
        city: null,
        coordinates: null,
        residential: false,
      }
      loadCalculateShippingAPI(data, validateCalculateShipping)
    }
  )
})
