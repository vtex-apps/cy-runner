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
import sla from '../../support/fedex-shipping/sla.js'
import { graphql } from '../../support/common/graphql_utils'

const { prefix } = singleProduct
let amount = ''

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
      const filtershippingMethod = response.body.filter(
        (b) => b.shippingMethod === sla.FirstOvernight
      )

      amount = filtershippingMethod[0].price
    })
  })

  it(
    `${prefix} - Set product quantity to 2 and verify shipping price via API`,
    updateRetry(3),
    () => {
      data.items[0].quantity = 2
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        const filtershippingMethod = response.body.filter(
          (b) => b.shippingMethod === sla.FirstOvernight
        )

        expect(filtershippingMethod[0].price).to.equal(amount * 2)
      })
    }
  )
})
