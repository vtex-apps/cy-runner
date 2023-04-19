import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { ROLE_DROP_DOWN, STATUSES } from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import { verifySession } from '../../support/b2b/common.js'
import {
  checkoutProduct,
  fillContactInfo,
  verifyAddress,
  verifyPayment,
  ordertheProduct,
} from '../../support/b2b/checkout.js'
import {
  // rejectQuote,
  filterQuoteByStatus,
} from '../../support/b2b/quotes.js'
import {
  quickOrderBySkuAndQuantityTestCase1,
  quickOrderBySkuAndQuantityTestCase2,
  quickOrderBySkuAnd51QuantityTestCase,
} from '../../support/quick-order/testcase.js'

describe('Organization A - Cost Center A1 - Organization Admin2 Scenario', () => {
  loginViaCookies({ storeFrontCookie: false })

  const { product, costCenter2, users, quotes } = b2b.OrganizationA

  loginToStoreFront(users.OrganizationAdmin2, ROLE_DROP_DOWN.OrganizationAdmin)
  verifySession(
    b2b.OrganizationA,
    costCenter2.name,
    ROLE_DROP_DOWN.OrganizationAdmin
  )
  quickOrderBySkuAndQuantityTestCase1(
    ROLE_DROP_DOWN.OrganizationAdmin,
    quotes.OrganizationAdmin2.quotes1,
    '$162.00'
  )
  quickOrderBySkuAndQuantityTestCase2(ROLE_DROP_DOWN.OrganizationAdmin)
  quickOrderBySkuAnd51QuantityTestCase(ROLE_DROP_DOWN.OrganizationAdmin)
  filterQuoteByStatus(STATUSES.declined)

  checkoutProduct(product)
  fillContactInfo()
  verifyAddress(costCenter2.addresses)
  verifyPayment(false)
  ordertheProduct(ROLE_DROP_DOWN.OrganizationAdmin)

  preserveCookie()
})
