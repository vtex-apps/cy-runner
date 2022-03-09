import {
  testSetup,
  preserveCookie,
} from '../../support/cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  STATUSES,
} from '../../support/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b_login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b_common_testcase.js'
import {
  searchQuote,
  quoteShouldNotBeVisibleTestCase,
  quoteShouldbeVisibleTestCase,
  filterQuoteByStatus,
} from '../../support/b2b_quotes_testcase.js'

describe('Sales Rep Scenarios', () => {
  testSetup(false, false)

  const { organizationName, nonAvailableProduct, quotes, users } =
    b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(users.SalesManager, roleObject.SalesManager.role)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.OrganizationAdmin.quotes1,
    organizationName
  )
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.Buyer2.quotes1,
    organizationName
  )
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    organizationBQuote.OrganizationAdmin.quotes1,
    organizationB
  )
  searchQuote(quotes.OrganizationAdmin.quotes1)
  filterQuoteByStatus(STATUSES.pending)
  preserveCookie()
})
