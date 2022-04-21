import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_ID_EMAIL_MAPPING as roleObject } from '../../support/b2b/utils.js'
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
} from '../../support/b2b/checkout.js'

describe('Organization A - Cost Center A1 - Sales Admin Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, product, costCenter1, users } = b2b.OrganizationA

  loginToStoreFront(users.SalesAdmin, roleObject.SalesAdmin.role)
  verifySession(b2b.OrganizationA)
  verifyImpersonationFeatureAvailable(
    roleObject.SalesAdmin.role,
    roleObject.SalesRepresentative.role
  )
  verifyImpersonationFeatureAvailable(
    roleObject.SalesAdmin.role,
    roleObject.SalesManager.role
  )
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter1.addresses)
  verifyPayment()
  preserveCookie()
})
