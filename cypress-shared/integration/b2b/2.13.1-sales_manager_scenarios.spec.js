import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
  userShouldNotImpersonateThisUser,
} from '../../support/b2b/common.js'
import { searchQuote, filterQuoteByStatus } from '../../support/b2b/quotes.js'
import { salesManagerQuotesAccess } from '../../support/b2b/impersonation_quote_access.js'

describe('Organization A - Cost Center A1 - Sales Manager Basic Scenario', () => {
  loginViaCookies({ storeFrontCookie: false })

  const { nonAvailableProduct, users, costCenter1, quotes } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(users.SalesManager, roleObject.SalesManager.role)
  verifySession(
    b2b.OrganizationA,
    costCenter1.name,
    roleObject.SalesManager.role
  )
  userShouldNotImpersonateThisUser(
    roleObject.SalesManager.role,
    roleObject.SalesRepresentative.role,
    users.SalesRepresentative.email
  )
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  salesManagerQuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)

  searchQuote(quotes.OrganizationAdmin.quotes1)
  filterQuoteByStatus(STATUSES.pending)

  preserveCookie()
})
