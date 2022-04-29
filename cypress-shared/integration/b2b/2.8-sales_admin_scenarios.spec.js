import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_ID_EMAIL_MAPPING as roleObject,
  ROLE_DROP_DOWN,
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  STATUSES,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  salesUserShouldImpersonateNonSalesUser,
  userShouldNotImpersonateThisUser,
  verifySession,
} from '../../support/b2b/common.js'
import {
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
} from '../../support/b2b/checkout.js'
import {
  addCostCenter,
  deleteCostCenter,
  updateCostCenter,
} from '../../support/b2b/cost_center.js'
import { addAndupdateUser } from '../../support/b2b/add_users.js'
import {
  searchQuote,
  createQuote,
  discountSliderShouldNotExist,
  updateQuote,
  rejectQuote,
  filterQuote,
  filterQuoteByStatus,
  quoteShouldbeVisibleTestCase,
  verifyQuotesAndSavedCarts,
} from '../../support/b2b/quotes.js'

function QuotesAccess(
  { organizationName, quotes },
  organizationB,
  organizationBQuote
) {
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.Buyer2.quotes1,
    organizationName
  )
  quoteShouldbeVisibleTestCase(
    organizationName,
    organizationBQuote.OrganizationAdmin.quotes1,
    organizationB
  )
}

describe('Organization A - Cost Center A1 - Sales Admin Scenario', () => {
  testSetup(false)

  const {
    product,
    organizationName,
    nonAvailableProduct,
    costCenter1,
    costCenter2,
    costCenter4,
    users,
    quotes,
  } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  const impersonatedRole = ROLE_DROP_DOWN.OrganizationAdmin

  loginToStoreFront(users.SalesAdmin, roleObject.SalesAdmin.role)
  verifySession(b2b.OrganizationA)

  // Impersonate users
  userShouldNotImpersonateThisUser(
    roleObject.SalesAdmin.role,
    roleObject.SalesManager.role
  )
  QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)
  // Cost Center 3 - Scenarios
  addCostCenter(
    organizationName,
    costCenter4.temporaryName,
    costCenter4.addresses[0]
  )
  updateCostCenter(costCenter4.temporaryName, costCenter4.name)
  deleteCostCenter(costCenter4.name)

  // Add/Update users for costcenter2
  addAndupdateUser(
    organizationName,
    { currentCostCenter: costCenter1.name, updateCostCenter: costCenter2.name },
    { currentRole: role.OrganizationAdmin2, updatedRole: role.Buyer2 }
  )

  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  verifyQuotesAndSavedCarts()

  searchQuote(quotes.Buyer.quotes1)
  filterQuote(costCenter1.name, organizationB)
  discountSliderShouldNotExist(quotes.Buyer2.quotes3)
  updateQuote(quotes.Buyer.quotes1, { discount: '10' })
  updateQuote(quotes.Buyer.quotes2, { notes: 'Notes' })
  const price = '30.00'
  const quantity = '10'

  updateQuote(quotes.Buyer.quotes6, { price, quantity })
  rejectQuote(quotes.Buyer.quotes3, roleObject.SalesAdmin.role)
  filterQuoteByStatus(STATUSES.ready, STATUSES.declined)
  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter1.addresses)
  verifyPayment()
  salesUserShouldImpersonateNonSalesUser(
    roleObject.SalesAdmin.role,
    impersonatedRole
  )
  QuotesAccess(b2b.OrganizationA, organizationB, organizationBQuote)

  userShouldNotImpersonateThisUser(roleObject.SalesManager.role)
  const quote = 'IMPERSONATE_QUOTE_1'

  createQuote({
    product,
    quoteEnv: quote,
    role: roleObject.SalesManager.role,
    impersonatedRole,
  })
  searchQuote(quote, users.OrganizationAdmin1)

  preserveCookie()
})
