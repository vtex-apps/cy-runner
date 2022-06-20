import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  salesUserShouldImpersonateNonSalesUser,
  userShouldNotImpersonateThisUser,
  verifySession,
  stopImpersonation,
} from '../../support/b2b/common.js'
import { searchQuote, createQuote } from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A1 - Sales Rep Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, users, product, costCenter1 } = b2b.OrganizationA

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
