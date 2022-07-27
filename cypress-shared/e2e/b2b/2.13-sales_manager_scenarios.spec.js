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
import { createQuote, searchQuote } from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A1 - Sales Manager Scenario', () => {
  testSetup(false)

  const { nonAvailableProduct, users, product, costCenter1 } = b2b.OrganizationA

  loginToStoreFront(users.SalesManager, roleObject.SalesManager.role)
  verifySession(
    b2b.OrganizationA,
    costCenter1.name,
    roleObject.SalesManager.role
  )
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  userShouldNotImpersonateThisUser(
    roleObject.SalesManager.role,
    roleObject.SalesRepresentative.role,
    users.SalesRep
  )

  const impersonatedRole = ROLE_DROP_DOWN.OrganizationAdmin

  salesUserShouldImpersonateNonSalesUser(
    roleObject.SalesManager.role,
    impersonatedRole,
    users.OrganizationAdmin1
  )

  const quote = 'IMPERSONATE_QUOTE_2'

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
