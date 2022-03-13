import {
  testSetup,
  preserveCookie,
} from '../../support/common/common_support.js'
import b2b from '../../support/b2b/b2b_constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b/b2b_login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b/b2b_common_testcase.js'
import {
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
} from '../../support/b2b/b2b_checkout_testcase.js'

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
  preserveCookie()
})
