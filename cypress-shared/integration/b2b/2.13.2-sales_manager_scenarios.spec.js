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
  verifySession,
  stopImpersonation,
} from '../../support/b2b/common.js'
import { createQuote, searchQuote } from '../../support/b2b/quotes.js'
import { salesManagerQuotesAccess } from '../../support/b2b/impersonation_quote_access.js'

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

  const impersonatedRole = ROLE_DROP_DOWN.OrganizationAdmin

  salesUserShouldImpersonateNonSalesUser(
    roleObject.SalesManager.role,
    impersonatedRole,
    users.OrganizationAdmin1
  )
  const quote = 'IMPERSONATE_QUOTE_2'

  salesManagerQuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)

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
