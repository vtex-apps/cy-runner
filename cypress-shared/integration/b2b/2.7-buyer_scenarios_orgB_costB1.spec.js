import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b/common.js'
import {
  createQuote,
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b/quotes.js'

describe('Organization B - Cost Center B1 - Buyer Scenario', () => {
  loginViaCookies({ storeFrontCookie: false })

  const {
    organizationName,
    users,
    nonAvailableProduct,
    product,
    quotes,
    costCenter1,
    gmailCreds,
  } = b2b.OrganizationB

  const { organizationName: organizationA, quotes: organizationAQuotes } =
    b2b.OrganizationA

  loginToStoreFront(users.Buyer1, ROLE_DROP_DOWN.Buyer, gmailCreds)
  verifySession(b2b.OrganizationB, costCenter1.name, ROLE_DROP_DOWN.Buyer)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.OrganizationAdmin.quotes1,
    organizationName
  )
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    organizationAQuotes.OrganizationAdmin.quotes1,
    organizationA
  )
  createQuote({
    product,
    quoteEnv: quotes.Buyer.quotes1,
    role: ROLE_DROP_DOWN.Buyer,
  })

  preserveCookie()
})
