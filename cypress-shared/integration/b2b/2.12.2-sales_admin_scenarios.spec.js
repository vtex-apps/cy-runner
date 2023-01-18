import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  ROLE_DROP_DOWN,
  // ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  salesUserShouldImpersonateNonSalesUser,
  verifySession,
  stopImpersonation,
} from '../../support/b2b/common.js'
import {
  searchQuote,
  createQuote,
  // discountSliderShouldNotExist,
  updateQuote,
  // rejectQuote,
  // filterQuote,
  filterQuoteByStatus,
} from '../../support/b2b/quotes.js'
import { salesAdminQuotesAccess } from '../../support/b2b/impersonation_quote_access.js'

describe('Organization A - Cost Center A1 - Sales Admin Impersonation Scenario', () => {
  loginViaCookies({ storeFrontCookie: false })

  const { product, costCenter1, users, quotes, gmailCreds } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  const impersonatedRole = ROLE_DROP_DOWN.Approver

  loginToStoreFront(users.SalesAdmin, roleObject.SalesAdmin.role, gmailCreds)
  verifySession(b2b.OrganizationA, costCenter1.name, roleObject.SalesAdmin.role)

  salesUserShouldImpersonateNonSalesUser(
    roleObject.SalesAdmin.role,
    impersonatedRole,
    users.Approver1
  )

  updateQuote(quotes.Buyer.quotes1, { discount: '20' })
  updateQuote(quotes.Buyer.quotes2, { notes: 'Notes' })
  const price = '250.00'
  const quantity = '10'

  updateQuote(quotes.Buyer.quotes6, { price, quantity })
  filterQuoteByStatus(STATUSES.ready, STATUSES.declined)

  salesAdminQuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)

  const quote = 'IMPERSONATE_QUOTE_1'

  createQuote({
    product,
    quoteEnv: quote,
    role: roleObject.SalesManager.role,
    impersonatedRole,
  })
  searchQuote(quote, users.Approver1)
  stopImpersonation(
    b2b.OrganizationA,
    costCenter1.name,
    roleObject.SalesAdmin.role
  )
  preserveCookie()
})
