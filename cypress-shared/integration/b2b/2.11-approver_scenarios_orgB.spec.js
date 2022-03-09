import {
  testSetup,
  preserveCookie,
} from '../../support/cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import {
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  ROLE_DROP_DOWN,
} from '../../support/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b_login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b_common_testcase.js'
import {
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b_quotes_testcase.js'
import {
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
} from '../../support/b2b_checkout_testcase.js'

describe('Approver Scenarios Organization B', () => {
  testSetup(false, false)

  const {
    organizationName,
    product,
    quotes,
    nonAvailableProduct,
    costCenter1,
    users,
  } = b2b.OrganizationB
  const { organizationName: organizationA, quotes: organizationAQuotes } =
    b2b.OrganizationA
  loginToStoreFront(users.Approver1, ROLE_DROP_DOWN.Approver)
  verifySession(b2b.OrganizationB)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  //   quoteShouldbeVisibleTestCase(
  //     organizationName,
  //     quotes.OrganizationAdmin.quotes1,
  //     organizationName
  //   )
  //   quoteShouldNotBeVisibleTestCase(
  //     organizationName,
  //     organizationAQuotes.OrganizationAdmin.quotes1,
  //     organizationA
  //   )
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter1.addresses[0])
  verifyPayment(false)
  preserveCookie()
})
