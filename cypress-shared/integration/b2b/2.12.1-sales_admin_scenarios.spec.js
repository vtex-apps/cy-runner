import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  // ROLE_DROP_DOWN_EMAIL_MAPPING as role,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b/common.js'
import {
  searchQuote,
  verifyQuotesAndSavedCarts,
  // discountSliderShouldNotExist,
  // rejectQuote,
  // filterQuote,
} from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A1 - Sales Admin Scenario', () => {
  loginViaCookies({ storeFrontCookie: false })

  const { nonAvailableProduct, costCenter1, users, quotes, gmailCreds } =
    b2b.OrganizationA

  loginToStoreFront(users.SalesAdmin, roleObject.SalesAdmin.role, gmailCreds)
  verifySession(b2b.OrganizationA, costCenter1.name, roleObject.SalesAdmin.role)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)

  verifyQuotesAndSavedCarts()
  searchQuote(quotes.Buyer.quotes1)

  // filterQuote(costCenter1.name, organizationB)

  // discountSliderShouldNotExist(quotes.Buyer2.quotes3)

  // rejectQuote(quotes.Buyer.quotes3, roleObject.SalesAdmin.role)

  preserveCookie()
})
