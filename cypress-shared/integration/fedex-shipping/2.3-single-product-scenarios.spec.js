/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-expect-in-promise */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import {
  singleProduct,
  warehouseId,
} from '../../support/fedex-shipping/outputvalidation.js'
import { data } from '../../fixtures/fedex-shipping-fixtures/shippingRatePayload.json'
import {
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase.js'
import {
  verifyInventoryIsUnlimitedForFedexWareHouse,
  validateInventory,
} from '../../support/fedex-shipping/graphql_testcase.js'
import { INVENTORY_GRAPHQL_APP } from '../../support/fedex-shipping/graphql_apps.js'
import { graphql } from '../../support/common/graphql_utils'

const { prefix } = singleProduct
let shippingMethods = []

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`${prefix} - For fedex docks, verify inventory is set to infinite`, () => {
    graphql(
      INVENTORY_GRAPHQL_APP,
      verifyInventoryIsUnlimitedForFedexWareHouse(
        warehouseId,
        data.items[0].id
      ),
      validateInventory
    )
  })

  it(`${prefix} - Verify single product shipping price`, updateRetry(3), () => {
    loadCalculateShippingAPI(data).then((response) => {
      validateCalculateShipping(response)
      shippingMethods = response.body
    })
  })

  it(
    `${prefix} - Set product quantity to 2 and verify shipping price via API`,
    updateRetry(3),
    () => {
      data.items[0].quantity = 2
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        shippingMethods.forEach((shippingMethod) => {
          response.body.forEach((res) => {
            if (res.shippingMethod === shippingMethod.shippingMethod) {
              expect(shippingMethod.shippingMethod).to.equal(res.shippingMethod)

              expect(res.price).to.equal(shippingMethod.price * 2)
            }
          })
        })
      })
    }
  )
})
