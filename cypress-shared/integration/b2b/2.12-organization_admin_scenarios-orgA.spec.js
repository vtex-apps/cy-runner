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
import { organizationAdminShouldNotAbleToEditSalesUsers } from '../../support/b2b/b2b_organization_request_testcase.js'

describe('Organization A - Cost Center A1 - Organization Admin2 Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, product, costCenter1, users } = b2b.OrganizationA

  loginToStoreFront(users.OrganizationAdmin2, ROLE_DROP_DOWN.OrganizationAdmin)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  organizationAdminShouldNotAbleToEditSalesUsers()
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter1.addresses)
  verifyPayment(false)
  preserveCookie()
})
