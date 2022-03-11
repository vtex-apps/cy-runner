import {
  testSetup,
  preserveCookie,
} from '../../support/cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b_login.js'
import { verifySession } from '../../support/b2b_common_testcase.js'
import {
  fillContactInfo,
  verifyAddress,
  verifyPayment,
  checkoutProduct,
} from '../../support/b2b_checkout_testcase.js'

describe('Organization A - Cost Center A2 - Approver Scenario', () => {
  testSetup(false)

  const { costCenter2, users, product } = b2b.OrganizationA

  loginToStoreFront(users.Approver2, ROLE_DROP_DOWN.Approver)
  verifySession(b2b.OrganizationA)
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter2.addresses)
  verifyPayment(false)
  preserveCookie()
})
