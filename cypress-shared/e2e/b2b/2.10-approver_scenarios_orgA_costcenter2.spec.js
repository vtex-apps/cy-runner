import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  verifySession,
  productShouldNotbeAvailableTestCase,
} from '../../support/b2b/common.js'

describe('Organization A - Cost Center A2 - Approver Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, costCenter2, users } = b2b.OrganizationA

  loginToStoreFront(users.Approver2, ROLE_DROP_DOWN.Approver)
  verifySession(b2b.OrganizationA, costCenter2.name, ROLE_DROP_DOWN.Approver)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)

  preserveCookie()
})
