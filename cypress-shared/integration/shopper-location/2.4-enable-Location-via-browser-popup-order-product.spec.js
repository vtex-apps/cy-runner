import { loginViaAPI, preserveCookie } from '../../support/common/support'
import { orderProductTestCase } from '../../support/shopper-location/common'
import {
  UsDetails,
  location,
} from '../../support/shopper-location/outputvalidation'

const { country, postalCode } = UsDetails

const prefix = 'Enable location'

describe(`${prefix}- via browser popup - Order the Product`, () => {
  loginViaAPI()

  orderProductTestCase(prefix, {
    lat: location.lat,
    long: location.long,
    country,
    postalCode,
  })

  preserveCookie()
})
