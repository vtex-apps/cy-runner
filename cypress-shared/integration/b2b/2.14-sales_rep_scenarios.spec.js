import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
  // STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifyImpersonationFeatureAvailable,
  verifySession,
} from '../../support/b2b/common.js'
import { organizationAdminShouldNotAbleToEditSalesUsers } from '../../support/b2b/organization_request.js'

describe('Organization A - Cost Center A1 - Sales Rep Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, users } = b2b.OrganizationA

  loginToStoreFront(users.SalesRep, roleObject.SalesRepresentative.role)
  verifySession(b2b.OrganizationA)
  verifyImpersonationFeatureAvailable(ROLE_DROP_DOWN.OrganizationAdmin, true)
  verifyImpersonationFeatureAvailable(ROLE_DROP_DOWN.Buyer, true)
  verifyImpersonationFeatureAvailable(roleObject.SalesAdmin.role)
  verifyImpersonationFeatureAvailable(roleObject.SalesManager.role)
  verifyImpersonationFeatureAvailable(ROLE_DROP_DOWN.Approver)
  organizationAdminShouldNotAbleToEditSalesUsers()
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  preserveCookie()
})
