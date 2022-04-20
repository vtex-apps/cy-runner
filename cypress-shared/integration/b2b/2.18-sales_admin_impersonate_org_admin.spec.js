import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  ROLE_DROP_DOWN,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  verifyImpersonationFeatureAvailable,
  verifySession,
} from '../../support/b2b/common.js'

describe('Organization A - Verify Sales User is able to impersonate Organization Admin', () => {
  testSetup(false)

  const { users } = b2b.OrganizationA

  loginToStoreFront(users.SalesRep, roleObject.SalesRepresentative.role)
  verifySession(b2b.OrganizationA)
  verifyImpersonationFeatureAvailable(
    roleObject.SalesRepresentative.role,
    ROLE_DROP_DOWN.OrganizationAdmin,
    true
  )
  preserveCookie()
})
