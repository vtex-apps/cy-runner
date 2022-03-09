import {
  testSetup,
  preserveCookie,
} from '../../support/cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import {
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  ROLE_DROP_DOWN,
  ROLE_DROP_DOWN_EMAIL_MAPPING,
} from '../../support/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b_login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b_common_testcase.js'
import {
  searchQuote,
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
  useQuoteForPlacingTheOrder,
} from '../../support/b2b_quotes_testcase.js'
import {
  fillContactInfo,
  verifyAddress,
  verifyPayment,
  checkoutProduct,
} from '../../support/b2b_checkout_testcase.js'

describe('Approver2 Scenarios Organization A', () => {
  testSetup(false)

  const {
    organizationName,
    quotes,
    nonAvailableProduct,
    costCenter2,
    users,
    product,
  } = b2b.OrganizationA
  const { organizationName: organizationB, quotes: organizationBquotes } =
    b2b.OrganizationB

  loginToStoreFront(users.Approver2, ROLE_DROP_DOWN.Approver)
  verifySession(b2b.OrganizationA)
  // productShouldNotbeAvailableTestCase(nonAvailableProduct)
  // quoteShouldbeVisibleTestCase(
  //   organizationName,
  //   quotes.Buyer2.quotes1,
  //   organizationName
  // )
  // quoteShouldNotBeVisibleTestCase(
  //   organizationName,
  //   organizationBquotes.OrganizationAdmin.quotes1,
  //   organizationB
  // )
  // searchQuote(quotes.Approver2.updateQuote)
  // useQuoteForPlacingTheOrder(
  //   quotes.Approver2.updateQuote,
  //   role.Approver2.dropDownText
  // )
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter2.addresses)
  verifyPayment(false)
  preserveCookie()
})
