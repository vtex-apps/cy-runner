import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  ROLE_DROP_DOWN,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
  userAndCostCenterShouldNotBeEditable,
  userAndCostCenterShouldNotBeAdded,
} from '../../support/b2b/common.js'
import { buyNowProductTestCase } from '../../support/b2b/checkout.js'

describe('Organization A - Cost Center A1 - Buyer Scenarios', () => {
  testSetup(false)

  const { organizationName, nonAvailableProduct, product, costCenter1, users } =
    b2b.OrganizationA

  loginToStoreFront(users.Buyer1, ROLE_DROP_DOWN.Buyer)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  userAndCostCenterShouldNotBeEditable(
    organizationName,
    costCenter1.name,
    role.Buyer1
  )
  userAndCostCenterShouldNotBeAdded(
    organizationName,
    costCenter1.name,
    role.Buyer1
  )

  buyNowProductTestCase(product)
  preserveCookie()
})
