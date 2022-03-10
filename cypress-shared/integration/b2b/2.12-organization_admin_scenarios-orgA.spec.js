import {
  testSetup,
  preserveCookie,
} from '../../support/cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  STATUSES,
} from '../../support/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b_login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b_common_testcase.js'
import {
  searchQuote,
  quoteShouldNotBeVisibleTestCase,
  quoteShouldbeVisibleTestCase,
  filterQuoteByStatus,
} from '../../support/b2b_quotes_testcase.js'
import {
  quickOrderBySkuAndQuantityTestCase1,
  quickOrderBySkuAndQuantityTestCase2,
  quickOrderBySkuAnd51QuantityTestCase,
} from '../../support/b2b_quick_order_testcase.js'
import {
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
  ordertheProduct,
} from '../../support/b2b_checkout_testcase.js'
import { organizationAdminShouldNotAbleToEditSalesUsers } from '../../support/b2b_organization_request_testcase.js'

describe('Organization A - Cost Center A1 - Organization Admin2 Scenario', () => {
  testSetup(false)

  const {
    organizationName,
    nonAvailableProduct,
    product,
    costCenter1,
    quotes,
    users,
  } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(users.OrganizationAdmin2, ROLE_DROP_DOWN.OrganizationAdmin)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  organizationAdminShouldNotAbleToEditSalesUsers()
  // quoteShouldbeVisibleTestCase(
  //   organizationName,
  //   quotes.OrganizationAdmin.quotes1,
  //   organizationName
  // )
  // quoteShouldbeVisibleTestCase(
  //   organizationName,
  //   quotes.Buyer2.quotes1,
  //   organizationName
  // )
  // quoteShouldNotBeVisibleTestCase(
  //   organizationName,
  //   organizationBQuote.OrganizationAdmin.quotes1,
  //   organizationB
  // )
  // searchQuote(quotes.OrganizationAdmin2.quotes1)
  // TODO: Raised issue for this ticket
  // rejectQuote(
  //   quotes.OrganizationAdmin2.declineQuote,
  //   ROLE_DROP_DOWN.OrganizationAdmin
  // )
  // quickOrderBySkuAndQuantityTestCase1(
  //   ROLE_DROP_DOWN.OrganizationAdmin,
  //   quotes.OrganizationAdmin2.quotes1
  // )
  // quickOrderBySkuAndQuantityTestCase2(ROLE_DROP_DOWN.OrganizationAdmin)
  // quickOrderBySkuAnd51QuantityTestCase(ROLE_DROP_DOWN.OrganizationAdmin)
  // filterQuoteByStatus(STATUSES.declined)
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter1.addresses)
  verifyPayment(false)
  // ordertheProduct(ROLE_DROP_DOWN.OrganizationAdmin)
  preserveCookie()
})
