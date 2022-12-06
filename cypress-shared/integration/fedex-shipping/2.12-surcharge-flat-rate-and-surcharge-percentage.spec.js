/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import { appSetting } from '../../support/fedex-shipping/outputvalidation'
import { data } from '../../fixtures/fedex-shipping-fixtures/shippingRatePayload.json'
import { updateSLASettings } from '../../support/fedex-shipping/common.js'
import {
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase.js'
import sla from '../../support/fedex-shipping/sla.js'

const prefix = 'Update SLA - Surcharge Flat Rate & Surcharge Percentage'
let amount = 0
const surchargeFlatRate = 10
const surchargePercent = 15

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(
    `${prefix} - Update Surcharge Flat Rate and Surcharge Percentage`,
    updateRetry(3),
    () => {
      updateSLASettings(appSetting)
    }
  )

  it(`${prefix} - Verify single product shipping price`, updateRetry(3), () => {
    loadCalculateShippingAPI(data).then((response) => {
      validateCalculateShipping(response)
      const filtershippingMethod = response.body.filter(
        (b) => b.shippingMethod === sla.FedexHomeDelivery
      )

      amount = filtershippingMethod[0].price
    })
  })

  it(
    ` ${prefix} - Update Surcharge Flat Rate and Surcharge Percentage`,
    updateRetry(3),
    () => {
      updateSLASettings(appSetting, surchargeFlatRate, surchargePercent)
    }
  )

  it(`${prefix} - Validate Surcharge Changes`, updateRetry(3), () => {
    loadCalculateShippingAPI(data).then((response) => {
      validateCalculateShipping(response)
      const filtershippingMethod = response.body.filter(
        (b) => b.shippingMethod === sla.FedexHomeDelivery
      )

      const percentage = (amount * surchargePercent) / 100
      const rate = amount + surchargeFlatRate
      const total = percentage + rate

      expect(filtershippingMethod[0].price.toFixed(2)).to.equal(
        total.toFixed(2)
      )
    })
  })
})
