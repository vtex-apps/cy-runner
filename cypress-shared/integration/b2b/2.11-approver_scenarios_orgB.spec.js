import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b/common.js'
import {
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
  ordertheProduct,
} from '../../support/b2b/checkout.js'

describe('Organization B - Cost Center B1 - Approver Scenario', () => {
  testSetup(false)

  const { product, nonAvailableProduct, costCenter1, users } = b2b.OrganizationB

  loginToStoreFront(users.Approver1, ROLE_DROP_DOWN.Approver)
  verifySession(b2b.OrganizationB)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter1.addresses)
  verifyPayment(false)
  ordertheProduct(ROLE_DROP_DOWN.Approver)
  preserveCookie()
})
