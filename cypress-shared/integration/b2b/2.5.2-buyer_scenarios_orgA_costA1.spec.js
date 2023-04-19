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
  quickOrderByOneByOneTestCase,
  quickOrderByOneByOneNegativeTestCase,
} from '../../support/quick-order/testcase.js'

describe('Organization A - Cost Center A1 - Buyer Create Quote Scenarios', () => {
  loginViaCookies({ storeFrontCookie: false })

  const { costCenter1, users, product, product2, quotes } = b2b.OrganizationA

  loginToStoreFront(users.Buyer1, ROLE_DROP_DOWN.Buyer)
  verifySession(b2b.OrganizationA, costCenter1.name, ROLE_DROP_DOWN.Buyer)
  createQuote({
    product,
    quoteEnv: quotes.Buyer.quotes4,
    role: ROLE_DROP_DOWN.Buyer,
  })
  createQuote({
    product,
    quoteEnv: quotes.Buyer.quotes5,
    role: ROLE_DROP_DOWN.Buyer,
  })
  quickOrderByOneByOneTestCase(
    ROLE_DROP_DOWN.Buyer,
    product2,
    quotes.Buyer.quotes6,
    '$486.00'
  )
  quickOrderByOneByOneNegativeTestCase(
    ROLE_DROP_DOWN.Buyer,
    product2,
    quotes.Buyer.quotes7,
    '$24,300.00'
  )
  filterQuoteByStatus(STATUSES.ready)

  preserveCookie()
})
