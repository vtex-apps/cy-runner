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
  updateQuote,
  filterQuoteByStatus,
} from '../../support/b2b_quotes_testcase.js'

describe('Sales Rep Scenarios', () => {
  testSetup(false, false)

  const { organizationName, nonAvailableProduct, quotes, users } =
    b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(
    organizationName,
    roleObject.SalesRepresentative.role,
    roleObject.SalesRepresentative.email
  )
  loginToStoreFront(users.SalesRep, roleObject.SalesRepresentative.role)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    quotes.Buyer2.quotes1,
    organizationName
  )
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    organizationBQuote.OrganizationAdmin.quotes1,
    organizationB
  )
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.OrganizationAdmin.quotes1,
    organizationName
  )
  searchQuote(quotes.SalesRep.updateQuote)
  const price = '30.00'
  updateQuote(quotes.SalesRep.updateQuote, { price }, true)
  filterQuoteByStatus(STATUSES.revised)

  preserveCookie()
})
