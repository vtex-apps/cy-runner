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
  createQuote,
  quoteShouldNotBeVisibleTestCase,
  quoteShouldbeVisibleTestCase,
} from '../../support/b2b_quotes_testcase.js'
import { buyNowProductTestCase } from '../../support/b2b_checkout_testcase.js'

describe('Buyer Scenarios Organization B', () => {
  testSetup(false)

  const { organizationName, product, quotes, users, nonAvailableProduct } =
    b2b.OrganizationB
  const { organizationName: organizationA, quotes: organizationAQuotes } =
    b2b.OrganizationA
  loginToStoreFront(users.Buyer1, ROLE_DROP_DOWN.Buyer)
  verifySession(b2b.OrganizationB)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  // quoteShouldbeVisibleTestCase(
  //   organizationName,
  //   quotes.OrganizationAdmin.quotes1,
  //   organizationName
  // )
  // quoteShouldNotBeVisibleTestCase(
  //   organizationName,
  //   organizationAQuotes.OrganizationAdmin.quotes1,
  //   organizationA
  // )
  // createQuote({
  //   product,
  //   quoteEnv: quotes.Buyer.quotes1,
  //   role: ROLE_DROP_DOWN.Buyer,
  // })
  buyNowProductTestCase(product)
  preserveCookie()
})
