import { loginViaAPI, preserveCookie } from '../../support/common/support'
import { orderProductTestCase } from '../../support/shopper-location/common'
import { UsDetails } from '../../support/shopper-location/outputvalidation'

const { country, postalCode } = UsDetails

const prefix = 'Disable location'

describe(`${prefix}- via browser popup - Order the Product`, () => {
  loginViaAPI()

  orderProductTestCase(prefix, { country, postalCode })

  preserveCookie()
})
