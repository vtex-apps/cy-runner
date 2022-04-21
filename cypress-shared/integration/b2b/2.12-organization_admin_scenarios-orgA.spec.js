import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifyImpersonationFeatureAvailable,
  verifySession,
} from '../../support/b2b/common.js'
import {
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
  ordertheProduct,
} from '../../support/b2b/checkout.js'
import { organizationAdminShouldNotAbleToEditSalesUsers } from '../../support/b2b/organization_request.js'

describe('Organization A - Cost Center A1 - Organization Admin2 Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, product, costCenter2, users } = b2b.OrganizationA

  loginToStoreFront(users.OrganizationAdmin2, ROLE_DROP_DOWN.OrganizationAdmin)
  verifySession(b2b.OrganizationA)
  verifyImpersonationFeatureAvailable(roleObject.SalesManager)
  verifyImpersonationFeatureAvailable(ROLE_DROP_DOWN.Buyer)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  organizationAdminShouldNotAbleToEditSalesUsers()
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter2.addresses)
  verifyPayment(false)
  ordertheProduct(ROLE_DROP_DOWN.OrganizationAdmin)

  preserveCookie()
})
