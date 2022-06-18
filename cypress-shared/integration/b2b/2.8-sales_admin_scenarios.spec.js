import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  ROLE_DROP_DOWN,
  // ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  // STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  salesUserShouldImpersonateNonSalesUser,
  userShouldNotImpersonateThisUser,
  verifySession,
  stopImpersonation,
} from '../../support/b2b/common.js'
// import {
//   checkoutProduct,
//   fillContactInfo,
//   verifyAddress,
//   verifyPayment,
// } from '../../support/b2b/checkout.js'
import {
  searchQuote,
  createQuote,
  // discountSliderShouldNotExist,
  // updateQuote,
  // rejectQuote,
  // filterQuote,
  // filterQuoteByStatus,
  // quoteShouldbeVisibleTestCase,
  verifyQuotesAndSavedCarts,
} from '../../support/b2b/quotes.js'

// function QuotesAccess(
//   { organizationName, quotes },
//   organizationB,
//   organizationBQuote
// ) {
//   quoteShouldbeVisibleTestCase(
//     organizationName,
//     quotes.Buyer2.quotes1,
//     organizationName
//   )
//   quoteShouldbeVisibleTestCase(
//     organizationName,
//     organizationBQuote.OrganizationAdmin.quotes1,
//     organizationB
//   )
// }

describe('Organization A - Cost Center A1 - Sales Admin Scenario', () => {
  testSetup(false)

  const {
    product,
    nonAvailableProduct,
    costCenter1,
    users,
    // quotes,
  } = b2b.OrganizationA

  // const { organizationName: organizationB, quotes: organizationBQuote } =
  //   b2b.OrganizationB

  const impersonatedRole = ROLE_DROP_DOWN.Approver

  loginToStoreFront(users.SalesAdmin, roleObject.SalesAdmin.role)
  verifySession(b2b.OrganizationA, costCenter1.name, roleObject.SalesAdmin.role)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)

  // Impersonate users
  userShouldNotImpersonateThisUser(
    roleObject.SalesAdmin.role,
    roleObject.SalesManager.role,
    users.SalesManager
  )
  // QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)
  salesUserShouldImpersonateNonSalesUser(
    roleObject.SalesAdmin.role,
    impersonatedRole,
    users.Approver1
  )

  verifyQuotesAndSavedCarts()

  // searchQuote(quotes.Buyer.quotes1)
  // filterQuote(costCenter1.name, organizationB)
  // discountSliderShouldNotExist(quotes.Buyer2.quotes3)
  // updateQuote(quotes.Buyer.quotes1, { discount: '10' })
  // updateQuote(quotes.Buyer.quotes2, { notes: 'Notes' })
  // const price = '30.00'
  // const quantity = '10'

  // updateQuote(quotes.Buyer.quotes6, { price, quantity })
  // rejectQuote(quotes.Buyer.quotes3, roleObject.SalesAdmin.role)
  // filterQuoteByStatus(STATUSES.ready, STATUSES.declined)
  // checkoutProduct(product)
  // fillContactInfo()
  // verifyAddress(costCenter1.addresses)
  // verifyPayment()

  // QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)

  const quote = 'IMPERSONATE_QUOTE_1'

  createQuote({
    product,
    quoteEnv: quote,
    role: roleObject.SalesManager.role,
    impersonatedRole,
  })
  searchQuote(quote, users.Approver1)
  stopImpersonation(
    b2b.OrganizationA,
    costCenter1.name,
    roleObject.SalesAdmin.role
  )
  preserveCookie()
})
