import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b/common.js'
import {
  searchQuote,
  updateQuote,
  filterQuoteByStatus,
} from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A1 - Sales Rep Basic Scenario', () => {
  loginViaCookies({ storeFrontCookie: false })

  const { nonAvailableProduct, users, costCenter1, quotes, gmailCreds } =
    b2b.OrganizationA

  loginToStoreFront(
    users.SalesRep,
    roleObject.SalesRepresentative.role,
    gmailCreds
  )
  verifySession(
    b2b.OrganizationA,
    costCenter1.name,
    roleObject.SalesRepresentative.role
  )

  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  searchQuote(quotes.SalesRep.updateQuote)
  const price = '30.00'

  updateQuote(quotes.SalesRep.updateQuote, { price })
  filterQuoteByStatus(STATUSES.revised)

  preserveCookie()
})
