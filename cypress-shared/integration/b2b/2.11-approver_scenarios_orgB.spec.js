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
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
  ordertheProduct,
} from '../../support/b2b/checkout.js'
import {
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b/quotes.js'

describe('Organization B - Cost Center B1 - Approver Scenario', () => {
  loginViaCookies({ storeFrontCookie: false })

  const {
    product,
    nonAvailableProduct,
    costCenter1,
    users,
    quotes,
    organizationName,
    gmailCreds,
  } = b2b.OrganizationB

  const { organizationName: organizationA, quotes: organizationAQuotes } =
    b2b.OrganizationA

  loginToStoreFront(users.Approver1, ROLE_DROP_DOWN.Approver, gmailCreds)
  verifySession(b2b.OrganizationB, costCenter1.name, ROLE_DROP_DOWN.Approver)
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
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter1.addresses)
  verifyPayment(false)
  ordertheProduct(ROLE_DROP_DOWN.Approver)
  preserveCookie()
})
