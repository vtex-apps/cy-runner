import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
  // STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
  userShouldNotImpersonateThisUser,
} from '../../support/b2b/common.js'
// import {
//   checkoutProduct,
//   fillContactInfo,
//   verifyAddress,
//   verifyPayment,
//   ordertheProduct,
// } from '../../support/b2b/checkout.js'
import { organizationAdminShouldNotAbleToEditSalesUsers } from '../../support/b2b/organization_request.js'
// import {
//   searchQuote,
//   rejectQuote,
//   filterQuoteByStatus,
//   quoteShouldbeVisibleTestCase,
//   quoteShouldNotBeVisibleTestCase,
// } from '../../support/b2b/quotes.js'
// import {
//   quickOrderBySkuAndQuantityTestCase1,
//   quickOrderBySkuAndQuantityTestCase2,
//   quickOrderBySkuAnd51QuantityTestCase,
// } from '../../support/b2b/quick_order.js'

describe('Organization A - Cost Center A1 - Organization Admin2 Scenario', () => {
  testSetup(false)

  const {
    // organizationName,
    nonAvailableProduct,
    // product,
    costCenter2,
    users,
    // quotes,
  } = b2b.OrganizationA

  // const { organizationName: organizationB, quotes: organizationBQuote } =
  //   b2b.OrganizationB

  loginToStoreFront(users.OrganizationAdmin2, ROLE_DROP_DOWN.OrganizationAdmin)
  verifySession(
    b2b.OrganizationA,
    costCenter2.name,
    ROLE_DROP_DOWN.OrganizationAdmin
  )
  userShouldNotImpersonateThisUser(
    ROLE_DROP_DOWN.OrganizationAdmin,
    roleObject.SalesManager.role
  )
  userShouldNotImpersonateThisUser(
    ROLE_DROP_DOWN.OrganizationAdmin,
    ROLE_DROP_DOWN.Buyer
  )
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

  // checkoutProduct(product)
  // fillContactInfo()
  // verifyAddress(costCenter2.addresses)
  // verifyPayment(false)
  // ordertheProduct(ROLE_DROP_DOWN.OrganizationAdmin)

  preserveCookie()
})
