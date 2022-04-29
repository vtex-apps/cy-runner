import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
  STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  salesUserShouldImpersonateNonSalesUser,
  userShouldNotImpersonateThisUser,
  verifySession,
} from '../../support/b2b/common.js'
import {
  searchQuote,
  createQuote,
  updateQuote,
  filterQuoteByStatus,
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b/quotes.js'

function QuotesAccess(
  { organizationName, quotes },
  organizationB,
  organizationBQuote
) {
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
}

describe('Organization A - Cost Center A1 - Sales Rep Scenario', () => {
  testSetup(false)

  const { quotes, nonAvailableProduct, users, product } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  const impersonatedRole = ROLE_DROP_DOWN.Buyer

  loginToStoreFront(users.SalesRep, roleObject.SalesRepresentative.role)
  verifySession(b2b.OrganizationA)

  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)
  userShouldNotImpersonateThisUser(
    roleObject.SalesRepresentative.role,
    roleObject.SalesManager.role
  )
  searchQuote(quotes.SalesRep.updateQuote)
  const price = '30.00'

  updateQuote(quotes.SalesRep.updateQuote, { price }, true)
  filterQuoteByStatus(STATUSES.revised)
  salesUserShouldImpersonateNonSalesUser(impersonatedRole)
  QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)
  userShouldNotImpersonateThisUser(
    roleObject.SalesRepresentative.role,
    roleObject.SalesManager.role
  )

  const quote = 'IMPERSONATE_QUOTE_3'

  createQuote({
    product,
    quoteEnv: quote,
    role: roleObject.SalesRepresentative.role,
    impersonatedRole,
  })
  searchQuote(quote, users.Buyer1)

  preserveCookie()
})
