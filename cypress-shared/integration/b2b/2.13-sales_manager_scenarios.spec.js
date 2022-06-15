import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  ROLE_DROP_DOWN,
  // STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  salesUserShouldImpersonateNonSalesUser,
  userShouldNotImpersonateThisUser,
  verifySession,
} from '../../support/b2b/common.js'
import {
  createQuote,
  // searchQuote,
  // filterQuoteByStatus,
  // quoteShouldbeVisibleTestCase,
  // quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b/quotes.js'

// function QuotesAccess(
//   { organizationName, quotes },
//   organizationB,
//   organizationBQuote
// ) {
//   quoteShouldbeVisibleTestCase(
//     organizationName,
//     quotes.OrganizationAdmin.quotes1,
//     organizationName
//   )
//   quoteShouldbeVisibleTestCase(
//     organizationName,
//     quotes.Buyer2.quotes1,
//     organizationName
//   )
//   quoteShouldNotBeVisibleTestCase(
//     organizationName,
//     organizationBQuote.OrganizationAdmin.quotes1,
//     organizationB
//   )
// }

describe('Organization A - Cost Center A1 - Sales Manager Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, users, product } = b2b.OrganizationA

  // const { organizationName: organizationB, quotes: organizationBQuote } =
  //   b2b.OrganizationB

  const impersonatedRole = ROLE_DROP_DOWN.Approver

  loginToStoreFront(users.SalesManager, roleObject.SalesManager.role)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  userShouldNotImpersonateThisUser(
    roleObject.SalesManager.role,
    roleObject.SalesRepresentative.role
  )
  // searchQuote(quotes.OrganizationAdmin.quotes1)
  // filterQuoteByStatus(STATUSES.pending)
  // QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)
  salesUserShouldImpersonateNonSalesUser(
    roleObject.SalesManager.role,
    impersonatedRole
  )
  // QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)
  userShouldNotImpersonateThisUser(
    roleObject.SalesManager.role,
    roleObject.SalesRepresentative.role
  )
  const quote = 'IMPERSONATE_QUOTE_2'

  createQuote({
    product,
    quoteEnv: quote,
    role: roleObject.SalesManager.role,
    impersonatedRole,
  })

  preserveCookie()
})
