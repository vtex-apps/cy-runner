import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
  // STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  salesUserShouldImpersonateNonSalesUser,
  userShouldNotImpersonateThisUser,
  verifySession,
  stopImpersonation,
} from '../../support/b2b/common.js'
import {
  searchQuote,
  createQuote,
  // updateQuote,
  // filterQuoteByStatus,
  // quoteShouldbeVisibleTestCase,
  // quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b/quotes.js'

// function QuotesAccess(
//   { organizationName, quotes },
//   organizationB,
//   organizationBQuote
// ) {
//   quoteShouldNotBeVisibleTestCase(
//     organizationName,
//     quotes.Buyer2.quotes1,
//     organizationName
//   )
//   quoteShouldNotBeVisibleTestCase(
//     organizationName,
//     organizationBQuote.OrganizationAdmin.quotes1,
//     organizationB
//   )
//   quoteShouldbeVisibleTestCase(
//     organizationName,
//     quotes.OrganizationAdmin.quotes1,
//     organizationName
//   )
// }

describe('Organization A - Cost Center A1 - Sales Rep Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, users, product, costCenter1 } = b2b.OrganizationA

  // const { organizationName: organizationB, quotes: organizationBQuote } =
  //   b2b.OrganizationB

  const impersonatedRole = ROLE_DROP_DOWN.Buyer

  loginToStoreFront(users.SalesRep, roleObject.SalesRepresentative.role)
  verifySession(
    b2b.OrganizationA,
    costCenter1.name,
    roleObject.SalesRepresentative.role
  )

  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  // QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)
  userShouldNotImpersonateThisUser(
    roleObject.SalesRepresentative.role,
    roleObject.SalesManager.role,
    users.SalesManager
  )
  // searchQuote(quotes.SalesRep.updateQuote)
  // const price = '30.00'

  // updateQuote(quotes.SalesRep.updateQuote, { price }, true)
  // filterQuoteByStatus(STATUSES.revised)
  // QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)

  salesUserShouldImpersonateNonSalesUser(
    roleObject.SalesRepresentative.role,
    impersonatedRole,
    users.Buyer1
  )

  const quote = 'IMPERSONATE_QUOTE_3'

  createQuote({
    product,
    quoteEnv: quote,
    role: roleObject.SalesRepresentative.role,
    impersonatedRole,
  })
  searchQuote(quote, users.Buyer1)
  stopImpersonation(
    b2b.OrganizationA,
    costCenter1.name,
    roleObject.SalesRepresentative.role
  )

  preserveCookie()
})
