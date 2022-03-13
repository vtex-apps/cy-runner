import {
  testSetup,
  preserveCookie,
} from '../../support/common/common_support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b/common.js'

describe('Organization A - Cost Center A2 - Buyer Scenarios', () => {
  testSetup(false)
  const { nonAvailableProduct, users } = b2b.OrganizationA

  loginToStoreFront(users.Buyer2, ROLE_DROP_DOWN.Buyer)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)

  preserveCookie()
})
