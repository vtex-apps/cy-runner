import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  verifyImpersonationFeatureAvailable,
  verifySession,
} from '../../support/b2b/common.js'

describe('Organization A - Verify Organization admin is getting permission popup on impersonating the sales user', () => {
  testSetup(false)

  const { users } = b2b.OrganizationA

  loginToStoreFront(users.OrganizationAdmin1, ROLE_DROP_DOWN.OrganizationAdmin)
  verifySession(b2b.OrganizationA)
  verifyImpersonationFeatureAvailable(
    ROLE_DROP_DOWN.OrganizationAdmin,
    roleObject.SalesAdmin
  )
  preserveCookie()
})
