import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_ID_EMAIL_MAPPING as roleObject } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  verifyImpersonationFeatureAvailable,
  verifySession,
} from '../../support/b2b/common.js'

describe('Organization A - Verify Sales User is not able to impersonate Sales User', () => {
  testSetup(false)

  const { users } = b2b.OrganizationA

  loginToStoreFront(users.SalesAdmin, roleObject.SalesAdmin.role)
  verifySession(b2b.OrganizationA)
  verifyImpersonationFeatureAvailable(
    roleObject.SalesAdmin.role,
    roleObject.SalesRepresentative.role
  )
  preserveCookie()
})
