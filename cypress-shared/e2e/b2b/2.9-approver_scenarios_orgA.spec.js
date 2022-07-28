import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b/common.js'
import {
  searchQuote,
  // rejectQuote,
  useQuoteForPlacingTheOrder,
  filterQuoteByStatus,
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
  verifySubTotal,
} from '../../support/b2b/quotes.js'
import {
  quickOrderByXLS,
  quickOrderByXLSNegativeTestCase,
} from '../../support/b2b/quick_order.js'
import {
  fillContactInfo,
  verifyAddress,
  verifyPayment,
} from '../../support/b2b/checkout.js'

describe('Organization A - Cost Center A1 - Approver Scenario', () => {
  testSetup(false)

  const {
    organizationName,
    nonAvailableProduct,
    users,
    costCenter1,
    quotes,
    gmailCreds,
  } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBquotes } =
    b2b.OrganizationB

  loginToStoreFront(users.Approver1, ROLE_DROP_DOWN.Approver, gmailCreds)
  verifySession(b2b.OrganizationA, costCenter1.name, ROLE_DROP_DOWN.Approver)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.OrganizationAdmin.quotes1,
    organizationName
  )
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    organizationBquotes.OrganizationAdmin.quotes1,
    organizationB
  )
  quickOrderByXLS(quotes.Approver.quotes1)
  quickOrderByXLSNegativeTestCase(quotes.Approver.quotes2)
  searchQuote(quotes.Buyer.quotes6)

  // Reject Quote not working
  // rejectQuote(quotes.Buyer.quotes6, role.Approver1.dropDownText)
  // rejectQuote(quotes.Buyer.quotes4, role.Approver1.dropDownText)
  filterQuoteByStatus(STATUSES.declined)

  useQuoteForPlacingTheOrder(quotes.Buyer.quotes1, role.Approver1.dropDownText)
  verifySubTotal(quotes.Buyer.quotes1)
  fillContactInfo()
  verifyAddress(costCenter1.addresses)
  verifyPayment()

  preserveCookie()
})
