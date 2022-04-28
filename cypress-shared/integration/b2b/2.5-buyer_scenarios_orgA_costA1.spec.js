import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
  STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
  userAndCostCenterShouldNotBeEditable,
  userAndCostCenterShouldNotBeAdded,
  verifyImpersonationFeatureAvailable,
} from '../../support/b2b/common.js'
import { buyNowProductTestCase } from '../../support/b2b/checkout.js'
import {
  createQuote,
  searchQuote,
  filterQuoteByStatus,
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b/quotes.js'
import {
  quickOrderByOneByOneTestCase,
  quickOrderByOneByOneNegativeTestCase,
} from '../../support/b2b/quick_order.js'

describe('Organization A - Cost Center A1 - Buyer Scenarios', () => {
  testSetup(false)

  const {
    organizationName,
    nonAvailableProduct,
    product,
    product2,
    costCenter1,
    users,
    quotes,
  } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(users.Buyer1, ROLE_DROP_DOWN.Buyer)
  verifySession(b2b.OrganizationA)
  verifyImpersonationFeatureAvailable(roleObject.SalesManager.role)
  verifyImpersonationFeatureAvailable(ROLE_DROP_DOWN.Approver)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  userAndCostCenterShouldNotBeEditable(
    organizationName,
    costCenter1.name,
    role.Buyer1
  )

  userAndCostCenterShouldNotBeAdded(
    organizationName,
    costCenter1.name,
    role.Buyer1
  )
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.OrganizationAdmin.quotes1,
    organizationName
  )
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    organizationBQuote.OrganizationAdmin.quotes1,
    organizationB
  )
  searchQuote(quotes.OrganizationAdmin.quotes1)
  createQuote({
    product,
    quoteEnv: quotes.Buyer.quotes1,
    role: ROLE_DROP_DOWN.Buyer,
  })
  createQuote(
    {
      product,
      quoteEnv: quotes.Buyer.quotes2,
      role: ROLE_DROP_DOWN.Buyer,
    },
    false
  )
  createQuote({
    product,
    quoteEnv: quotes.Buyer.quotes3,
    role: ROLE_DROP_DOWN.Buyer,
  })
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
    quotes.Buyer.quotes6
  )
  quickOrderByOneByOneNegativeTestCase(
    ROLE_DROP_DOWN.Buyer,
    product2,
    quotes.Buyer.quotes7
  )
  filterQuoteByStatus(STATUSES.revised)

  buyNowProductTestCase(product)
  preserveCookie()
})
