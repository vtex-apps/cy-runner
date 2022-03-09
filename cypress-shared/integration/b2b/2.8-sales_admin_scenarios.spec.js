import {
  testSetup,
  preserveCookie,
} from '../../support/cypress-template/common_support.js'
import b2b from '../../support/b2b_constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  STATUSES,
} from '../../support/b2b_utils.js'
import { loginToStoreFront } from '../../support/b2b_login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
} from '../../support/b2b_common_testcase.js'
import {
  searchQuote,
  filterQuote,
  filterQuoteByStatus,
  quoteShouldbeVisibleTestCase,
  updateQuote,
  rejectQuote,
} from '../../support/b2b_quotes_testcase.js'
import {
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
} from '../../support/b2b_checkout_testcase.js'

describe('Sales Admin Scenarios', () => {
  testSetup(false)

  const {
    organizationName,
    nonAvailableProduct,
    product,
    quotes,
    costCenter1,
    users,
  } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(users.SalesAdmin, roleObject.SalesAdmin.role)
  verifySession(b2b.OrganizationA)
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  // quoteShouldbeVisibleTestCase(
  //   organizationName,
  //   quotes.Buyer2.quotes1,
  //   organizationName
  // )
  // quoteShouldbeVisibleTestCase(
  //   organizationName,
  //   organizationBQuote.OrganizationAdmin.quotes1,
  //   organizationB
  // )
  // searchQuote(quotes.Buyer.quotes1)
  // filterQuote(costCenter1.name, organizationB)

  // updateQuote(quotes.Buyer.quotes1, { discount: '10' })
  // updateQuote(quotes.Buyer.quotes2, { notes: 'Notes' })
  // const price = '30.00'
  // const quantity = '10'
  // updateQuote(quotes.Buyer.quotes6, { price, quantity })
  // rejectQuote(quotes.Buyer.quotes3, roleObject.SalesAdmin.role)
  // filterQuoteByStatus(STATUSES.ready, STATUSES.declined)
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter1.addresses)
  verifyPayment()
  preserveCookie()
})
