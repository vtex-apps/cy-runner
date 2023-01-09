/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-expect-in-promise */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import { multiProduct } from '../../support/fedex-shipping/outputvalidation.js'
import { data } from '../../fixtures/fedex-shipping-fixtures/multiProductPayload.json'
import {
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase.js'

const { prefix } = multiProduct
let shippingMethods = []

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`${prefix} - Verify multi product shipping price`, updateRetry(3), () => {
    loadCalculateShippingAPI(data).then((response) => {
      validateCalculateShipping(response)
      shippingMethods = response.body
    })
  })

  it(
    `${prefix} - Set product quantity to 2 and verify shipping price via API`,
    updateRetry(3),
    () => {
      data.items[1].quantity = 2
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        shippingMethods.forEach((shippingMethod) => {
          response.body.forEach((res) => {
            if (
              res.shippingMethod === shippingMethod.shippingMethod &&
              res.numberOfPackages === 2
            ) {
              expect(shippingMethod.shippingMethod).to.equal(res.shippingMethod)

              expect(parseFloat(res.price.toFixed(2))).to.equal(
                shippingMethod.price * 2
              )
            }
          })
        })
      })
    }
  )
})
