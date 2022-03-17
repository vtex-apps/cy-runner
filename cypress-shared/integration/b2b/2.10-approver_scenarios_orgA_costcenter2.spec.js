import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import { verifySession } from '../../support/b2b/common.js'
import {
  fillContactInfo,
  verifyAddress,
  verifyPayment,
  checkoutProduct,
  ordertheProduct,
} from '../../support/b2b/checkout.js'

describe('Organization A - Cost Center A2 - Approver Scenario', () => {
  testSetup(false)

  const { costCenter2, users, product } = b2b.OrganizationA

  loginToStoreFront(users.Approver2, ROLE_DROP_DOWN.Approver)
  verifySession(b2b.OrganizationA)
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter2.addresses)
  verifyPayment(false)
  ordertheProduct(ROLE_DROP_DOWN.Approver)
  preserveCookie()
})
