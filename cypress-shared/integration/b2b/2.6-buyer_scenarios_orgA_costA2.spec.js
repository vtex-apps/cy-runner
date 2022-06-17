import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_DROP_DOWN } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b/common.js'
// import {
//   createQuote,
//   searchQuote,
//   filterQuoteByStatus,
//   quoteShouldNotBeVisibleTestCase,
// } from '../../support/b2b/quotes.js'
// import {
//   quickOrderByCategory,
//   quickOrderByCategoryNegativeTestCase,
// } from '../../support/b2b/quick_order.js'

describe('Organization A - Cost Center A2 - Buyer Scenarios', () => {
  testSetup(false)
  const { nonAvailableProduct, users, costCenter2 } = b2b.OrganizationA

  // const { organizationName: organizationB, quotes: organizationBQuote } =
  //   b2b.OrganizationB

  loginToStoreFront(users.Buyer2, ROLE_DROP_DOWN.Buyer)
  verifySession(b2b.OrganizationA, costCenter2.name, ROLE_DROP_DOWN.Buyer)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  // quoteShouldNotBeVisibleTestCase(
  //   organizationName,
  //   quotes.OrganizationAdmin.quotes1,
  //   organizationName
  // )
  // quoteShouldNotBeVisibleTestCase(
  //   organizationName,
  //   organizationBQuote.OrganizationAdmin.quotes1,
  //   organizationB
  // )
  // searchQuote(quotes.OrganizationAdmin.quotes1)
  // quickOrderByCategory(ROLE_DROP_DOWN.Buyer, quotes.Buyer2.quotes1)
  // quickOrderByCategoryNegativeTestCase(
  //   ROLE_DROP_DOWN.Buyer,
  //   quotes.Buyer2.quotes2
  // )
  // createQuote({
  //   product: product3,
  //   quoteEnv: quotes.Buyer2.quotes3,
  //   role: ROLE_DROP_DOWN.Buyer,
  // })
  // filterQuoteByStatus(STATUSES.pending)

  preserveCookie()
})
