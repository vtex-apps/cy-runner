import { testSetup, preserveCookie } from '../../support/common/support.js'
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
import { organizationAdminShouldNotAbleToEditSalesUsers } from '../../support/b2b/organization_request.js'
import { rejectQuote } from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A1 - Organization Admin2 Scenario', () => {
  testSetup(false)

  const {
    nonAvailableProduct,
    product,
    // costCenter1,
    costCenter2,
    users,
    quotes,
  } = b2b.OrganizationA

  loginToStoreFront(users.OrganizationAdmin2, ROLE_DROP_DOWN.OrganizationAdmin)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  organizationAdminShouldNotAbleToEditSalesUsers()
  rejectQuote(
    quotes.OrganizationAdmin2.declineQuote,
    ROLE_DROP_DOWN.OrganizationAdmin
  )

  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter2.addresses)
  verifyPayment(false)
  ordertheProduct(ROLE_DROP_DOWN.OrganizationAdmin)

  preserveCookie()
})
