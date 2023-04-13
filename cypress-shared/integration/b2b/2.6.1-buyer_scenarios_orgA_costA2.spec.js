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
import { quoteShouldNotBeVisibleTestCase } from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A2 - Buyer Scenarios', () => {
  loginViaCookies({ storeFrontCookie: false })
  const { organizationName, nonAvailableProduct, users, costCenter2, quotes } =
    b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(users.Buyer2, ROLE_DROP_DOWN.Buyer)
  verifySession(b2b.OrganizationA, costCenter2.name, ROLE_DROP_DOWN.Buyer)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    quotes.OrganizationAdmin.quotes1,
    organizationName
  )
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    organizationBQuote.OrganizationAdmin.quotes1,
    organizationB
  )

  preserveCookie()
})
