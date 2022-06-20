import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
  userShouldNotImpersonateThisUser,
} from '../../support/b2b/common.js'
import { organizationAdminShouldNotAbleToEditSalesUsers } from '../../support/b2b/organization_request.js'

describe('Organization A - Cost Center A1 - Organization Admin2 Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, costCenter2, users } = b2b.OrganizationA

  loginToStoreFront(users.OrganizationAdmin2, ROLE_DROP_DOWN.OrganizationAdmin)
  verifySession(
    b2b.OrganizationA,
    costCenter2.name,
    ROLE_DROP_DOWN.OrganizationAdmin
  )
  userShouldNotImpersonateThisUser(
    ROLE_DROP_DOWN.OrganizationAdmin,
    roleObject.SalesManager.role,
    users.SalesManager
  )
  userShouldNotImpersonateThisUser(
    ROLE_DROP_DOWN.OrganizationAdmin,
    ROLE_DROP_DOWN.Buyer,
    users.Buyer1
  )
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  organizationAdminShouldNotAbleToEditSalesUsers()

  preserveCookie()
})
