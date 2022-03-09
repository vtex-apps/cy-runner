import {
  testSetup,
  preserveCookie,
} from '../../support/cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import {
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  ROLE_DROP_DOWN,
  STATUSES,
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
  rejectQuote,
  useQuoteForPlacingTheOrder,
  filterQuoteByStatus,
} from '../../support/b2b_quotes_testcase.js'
import {
  quickOrderByXLS,
  quickOrderByXLSNegativeTestCase,
} from '../../support/b2b_quick_order_testcase.js'
import {
  fillContactInfo,
  verifyAddress,
  verifyPayment,
} from '../../support/b2b_checkout_testcase.js'

describe('Approver Scenarios Organization A', () => {
  testSetup(false)

  const { organizationName, quotes, costCenter1, nonAvailableProduct, users } =
    b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBquotes } =
    b2b.OrganizationB

  loginToStoreFront(users.Approver1, ROLE_DROP_DOWN.Approver)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  // quoteShouldbeVisibleTestCase(
  //   organizationName,
  //   quotes.OrganizationAdmin.quotes1,
  //   organizationName
  // )
  // quoteShouldNotBeVisibleTestCase(
  //   organizationName,
  //   organizationBquotes.OrganizationAdmin.quotes1,
  //   organizationB
  // )
  // quickOrderByXLS(quotes.Approver.quotes1)
  // quickOrderByXLSNegativeTestCase(quotes.Approver.quotes2)
  // searchQuote(quotes.Buyer.quotes6)
  // rejectQuote(quotes.Buyer.quotes6, role.Approver1.dropDownText)
  // rejectQuote(quotes.Buyer.quotes4, role.Approver1.dropDownText)
  // filterQuoteByStatus(STATUSES.declined)
  // useQuoteForPlacingTheOrder(quotes.Buyer.quotes1, role.Approver1.dropDownText)
  // fillContactInfo()
  // verifyAddress(costCenter1.addresses[0])
  // verifyPayment()
  preserveCookie()
})
