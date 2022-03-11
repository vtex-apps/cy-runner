import {
  testSetup,
  preserveCookie,
} from '../../support/cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b_login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b_common_testcase.js'
import { buyNowProductTestCase } from '../../support/b2b_checkout_testcase.js'

describe('Organization B - Cost Center B1 - Buyer Scenario', () => {
  testSetup(false)

  const { product, users, nonAvailableProduct } = b2b.OrganizationB

  loginToStoreFront(users.Buyer1, ROLE_DROP_DOWN.Buyer)
  verifySession(b2b.OrganizationB)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  buyNowProductTestCase(product)
  preserveCookie()
})
