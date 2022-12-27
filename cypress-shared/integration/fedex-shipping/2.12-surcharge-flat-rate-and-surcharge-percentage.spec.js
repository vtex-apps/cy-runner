/* eslint-disable jest/no-conditional-expect */
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

const prefix = 'Update SLA - Surcharge Flat Rate & Surcharge Percentage'
let shippingMethods = []
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
      shippingMethods = response.body
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

      shippingMethods.forEach((shippingMethod) => {
        response.body.forEach((res) => {
          // eslint-disable-next-line vtex/prefer-early-return
          if (res.shippingMethod === shippingMethod.shippingMethod) {
            const percentage = (shippingMethod.price * surchargePercent) / 100
            const rate = shippingMethod.price + surchargeFlatRate
            const total = percentage + rate

            expect(parseFloat(res.price.toFixed(2))).to.equal(
              parseFloat(total.toFixed(2))
            )
          }
        })
      })
    })
  })
})
