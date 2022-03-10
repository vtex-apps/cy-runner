import {
  testSetup,
  preserveCookie,
} from '../../support/cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import { ROLE_ID_EMAIL_MAPPING as roleObject } from '../../support/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b_login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b_common_testcase.js'

import {
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
} from '../../support/b2b_checkout_testcase.js'

describe('Organization A - Cost Center A1 - Sales Admin Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, product, costCenter1, users } = b2b.OrganizationA

  loginToStoreFront(users.SalesAdmin, roleObject.SalesAdmin.role)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter1.addresses)
  verifyPayment()
  preserveCookie()
})
