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
import sla from '../../support/fedex-shipping/sla.js'

const { prefix } = multiProduct
let amount = ''

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`${prefix} - Verify multi product shipping price`, updateRetry(3), () => {
    loadCalculateShippingAPI(data).then((response) => {
      validateCalculateShipping(response)
      const filtershippingMethod = response.body.filter(
        (b) =>
          b.shippingMethod === sla.FirstOvernight ||
          b.shippingMethod === sla.StandardOvernight
      )

      amount = filtershippingMethod[1].price
    })
  })

  it(
    `${prefix} - Set product quantity to 2 and verify shipping price via API`,
    updateRetry(3),
    () => {
      data.items[1].quantity = 2
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        const filtershippingMethod = response.body.filter(
          (b) =>
            b.shippingMethod === sla.FirstOvernight ||
            b.shippingMethod === sla.StandardOvernight
        )

        expect(parseFloat(filtershippingMethod[1].price.toFixed(2))).to.equal(
          parseFloat(amount) * 2
        )
      })
    }
  )
})
