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
  createQuote,
  searchQuote,
  filterQuoteByStatus,
  quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b_quotes_testcase.js'
import {
  quickOrderByCategory,
  quickOrderByCategoryNegativeTestCase,
} from '../../support/b2b_quick_order_testcase.js'

describe('Organization A - Cost Center A2 - Buyer Scenarios', () => {
  testSetup(false, false)
  const { organizationName, nonAvailableProduct, quotes, users } =
    b2b.OrganizationA
  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB
  loginToStoreFront(users.Buyer2, ROLE_DROP_DOWN.Buyer)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    quotes.OrganizationAdmin.quotes1,
    organizationName
  )
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    organizationBQuote.OrganizationAdmin.quotes1,
    organizationB
  )
  searchQuote(quotes.OrganizationAdmin.quotes1)
  quickOrderByCategory(ROLE_DROP_DOWN.Buyer, quotes.Buyer2.quotes1)
  quickOrderByCategoryNegativeTestCase(
    ROLE_DROP_DOWN.Buyer,
    quotes.Buyer2.quotes2
  )
  filterQuoteByStatus(STATUSES.pending)
  preserveCookie()
})
