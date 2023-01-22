/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-expect-in-promise */
import { updateRetry, loginViaCookies } from '../../support/common/support'
import { appSetting } from '../../support/fedex-shipping/outputvalidation'
import { data } from '../../fixtures/fedex-shipping-fixtures/shippingRatePayload.json'
import { updateSLASettings } from '../../support/fedex-shipping/common.js'
import {
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase'

const prefix = 'Shipping Optimize'
let shippingMethods = []
const surchargeFlatRate = 0
const surchargePercent = 30

describe('Modify SLA - Validate Surcharge Percentage in checkout', () => {
  loginViaCookies()

  it(`${prefix} - Update Surcharge Flat Rate`, updateRetry(3), () => {
    updateSLASettings(appSetting)
  })

  it(`${prefix} - Verify shipping price`, updateRetry(3), () => {
    loadCalculateShippingAPI(data).then((response) => {
      validateCalculateShipping(response)
      shippingMethods = response.body
    })
  })

  it(` ${prefix} - Update Surcharge percentage`, updateRetry(3), () => {
    updateSLASettings(appSetting, surchargeFlatRate, surchargePercent)
  })

  it(
    `${prefix} - Validate Surcharge Percentage Changes`,
    updateRetry(3),
    () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)

        shippingMethods.forEach((shippingMethod) => {
          response.body.forEach((res) => {
            // eslint-disable-next-line vtex/prefer-early-return
            if (res.shippingMethod === shippingMethod.shippingMethod) {
              const calculatePercentage =
                (shippingMethod.price * surchargePercent) / 100

              const calculateFlatRate = shippingMethod.price + surchargeFlatRate

              // eslint-disable-next-line jest/no-conditional-expect
              expect(parseFloat(res.price.toFixed(2))).to.equal(
                parseFloat((calculatePercentage + calculateFlatRate).toFixed(2))
              )
            }
          })
        })
      })
    }
  )
})
