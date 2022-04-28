import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  verifySession,
  productShouldNotbeAvailableTestCase,
} from '../../support/b2b/common.js'
import {
  fillContactInfo,
  verifyAddress,
  verifyPayment,
  checkoutProduct,
} from '../../support/b2b/checkout.js'
import {
  searchQuote,
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
  useQuoteForPlacingTheOrder,
  preventQuoteUpdation,
} from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A2 - Approver Scenario', () => {
  testSetup(false)

  const {
    organizationName,
    quotes,
    nonAvailableProduct,
    costCenter2,
    users,
    product,
  } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBquotes } =
    b2b.OrganizationB

  loginToStoreFront(users.Approver2, ROLE_DROP_DOWN.Approver)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.Buyer2.quotes1,
    organizationName
  )
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    organizationBquotes.OrganizationAdmin.quotes1,
    organizationB
  )
  searchQuote(quotes.Approver2.updateQuote)
  useQuoteForPlacingTheOrder(
    quotes.Approver2.updateQuote,
    role.Approver2.dropDownText
  )
  preventQuoteUpdation()

  checkoutProduct(product)

  fillContactInfo()
  verifyAddress(costCenter2.addresses[0])
  verifyPayment()
  preserveCookie()
})
