import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  ROLE_DROP_DOWN,
  STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifyImpersonationFeatureAvailable,
  verifySession,
} from '../../support/b2b/common.js'
import {
  searchQuote,
  filterQuoteByStatus,
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A1 - Sales Manager Scenario', () => {
  testSetup(false)

  const { organizationName, quotes, nonAvailableProduct, users } =
    b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(users.SalesManager, roleObject.SalesManager.role)
  verifySession(b2b.OrganizationA)
  verifyImpersonationFeatureAvailable(roleObject.SalesRepresentative.role)
  verifyImpersonationFeatureAvailable(roleObject.SalesAdmin.role)
  verifyImpersonationFeatureAvailable(ROLE_DROP_DOWN.Approver)
  verifyImpersonationFeatureAvailable(ROLE_DROP_DOWN.Buyer)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
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
  searchQuote(quotes.OrganizationAdmin.quotes1)
  filterQuoteByStatus(STATUSES.pending)

  preserveCookie()
})
