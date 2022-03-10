import {
  testSetup,
  preserveCookie,
} from '../../../cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b_login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b_common_testcase.js'

describe('Organization A - Cost Center A1 - Approver Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, users } = b2b.OrganizationA

  loginToStoreFront(users.Approver1, ROLE_DROP_DOWN.Approver)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  preserveCookie()
})
