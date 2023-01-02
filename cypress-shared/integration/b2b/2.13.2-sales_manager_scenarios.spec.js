import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  ROLE_DROP_DOWN,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  salesUserShouldImpersonateNonSalesUser,
  userShouldNotImpersonateThisUser,
  verifySession,
  stopImpersonation,
} from '../../support/b2b/common.js'
import {
  createQuote,
  searchQuote,
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b/quotes.js'

function QuotesAccess(
  { organizationName, quotes },
  organizationB,
  organizationBQuote
) {
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
}

describe('Organization A - Cost Center A1 - Sales Manager Impersonation Scenario', () => {
  loginViaCookies({ storeFrontCookie: false })

  const { users, product, costCenter1, gmailCreds } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(
    users.SalesManager,
    roleObject.SalesManager.role,
    gmailCreds
  )
  verifySession(
    b2b.OrganizationA,
    costCenter1.name,
    roleObject.SalesManager.role
  )
  userShouldNotImpersonateThisUser(
    roleObject.SalesManager.role,
    roleObject.SalesRepresentative.role,
    users.SalesRep
  )
  QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)

  const impersonatedRole = ROLE_DROP_DOWN.OrganizationAdmin

  salesUserShouldImpersonateNonSalesUser(
    roleObject.SalesManager.role,
    impersonatedRole,
    users.OrganizationAdmin1
  )
  const quote = 'IMPERSONATE_QUOTE_2'

  QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)

  createQuote({
    product,
    quoteEnv: quote,
    role: roleObject.SalesManager.role,
    impersonatedRole,
  })
  searchQuote(quote, users.OrganizationAdmin1)
  stopImpersonation(
    b2b.OrganizationA,
    costCenter1.name,
    roleObject.SalesManager.role
  )

  preserveCookie()
})
