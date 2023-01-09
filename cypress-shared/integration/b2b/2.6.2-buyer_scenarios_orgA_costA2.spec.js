import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_DROP_DOWN, STATUSES } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import { verifySession } from '../../support/b2b/common.js'
import { createQuote, filterQuoteByStatus } from '../../support/b2b/quotes.js'
import {
  quickOrderByCategory,
  quickOrderByCategoryNegativeTestCase,
} from '../../support/quick-order/testcase.js'

describe('Organization A - Cost Center A2 - Buyer Scenarios', () => {
  loginViaCookies({ storeFrontCookie: false })
  const { users, costCenter2, quotes, product3, gmailCreds } = b2b.OrganizationA

  loginToStoreFront(users.Buyer2, ROLE_DROP_DOWN.Buyer, gmailCreds)
  verifySession(b2b.OrganizationA, costCenter2.name, ROLE_DROP_DOWN.Buyer)
  quickOrderByCategory(ROLE_DROP_DOWN.Buyer, quotes.Buyer2.quotes1, '$84.60')
  quickOrderByCategoryNegativeTestCase(
    ROLE_DROP_DOWN.Buyer,
    quotes.Buyer2.quotes2,
    '$4,230.00'
  )
  createQuote({
    product: product3,
    quoteEnv: quotes.Buyer2.quotes3,
    role: ROLE_DROP_DOWN.Buyer,
  })
  filterQuoteByStatus(STATUSES.pending)

  preserveCookie()
})
