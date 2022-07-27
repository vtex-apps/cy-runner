import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  ROLE_DROP_DOWN,
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
  verifyQuotesAndSavedCarts,
} from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A1 - Sales Admin Scenario', () => {
  testSetup(false)

  const { product, nonAvailableProduct, costCenter1, users } = b2b.OrganizationA

  const impersonatedRole = ROLE_DROP_DOWN.Approver

  loginToStoreFront(users.SalesAdmin, roleObject.SalesAdmin.role)
  verifySession(b2b.OrganizationA, costCenter1.name, roleObject.SalesAdmin.role)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)

  // Impersonate users
  userShouldNotImpersonateThisUser(
    roleObject.SalesAdmin.role,
    roleObject.SalesManager.role,
    users.SalesManager
  )
  salesUserShouldImpersonateNonSalesUser(
    roleObject.SalesAdmin.role,
    impersonatedRole,
    users.Approver1
  )

  verifyQuotesAndSavedCarts()

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
