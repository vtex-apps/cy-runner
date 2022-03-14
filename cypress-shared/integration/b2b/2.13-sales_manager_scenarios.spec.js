import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_ID_EMAIL_MAPPING as roleObject } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b/common.js'

describe('Organization A - Cost Center A1 - Sales Manager Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, users } = b2b.OrganizationA

  loginToStoreFront(users.SalesManager, roleObject.SalesManager.role)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)

  preserveCookie()
})
