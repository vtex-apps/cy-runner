import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  ROLE_DROP_DOWN,
  ROLE_ID_EMAIL_MAPPING as roleObject,
} from '../../support/b2b/utils.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import {
  productShouldNotbeAvailableTestCase,
  verifySession,
  userShouldNotImpersonateThisUser,
} from '../../support/b2b/common.js'
import { organizationAdminShouldNotAbleToEditSalesUsers } from '../../support/b2b/organization_request.js'
import {
  searchQuote,
  // rejectQuote,
  quoteShouldbeVisibleTestCase,
  quoteShouldNotBeVisibleTestCase,
} from '../../support/b2b/quotes.js'

describe('Organization A - Cost Center A1 - Organization Admin2 Scenario', () => {
  loginViaCookies({ storeFrontCookie: false })

  const {
    organizationName,
    nonAvailableProduct,
    costCenter2,
    users,
    quotes,
    gmailCreds,
  } = b2b.OrganizationA

  const { organizationName: organizationB, quotes: organizationBQuote } =
    b2b.OrganizationB

  loginToStoreFront(
    users.OrganizationAdmin2,
    ROLE_DROP_DOWN.OrganizationAdmin,
    gmailCreds
  )
  verifySession(
    b2b.OrganizationA,
    costCenter2.name,
    ROLE_DROP_DOWN.OrganizationAdmin
  )
  organizationAdminShouldNotAbleToEditSalesUsers()
  userShouldNotImpersonateThisUser(
    ROLE_DROP_DOWN.OrganizationAdmin,
    roleObject.SalesManager.role,
    users.SalesManager
  )
  userShouldNotImpersonateThisUser(
    ROLE_DROP_DOWN.OrganizationAdmin,
    ROLE_DROP_DOWN.Buyer,
    users.Buyer1
  )
  productShouldNotbeAvailableTestCase(nonAvailableProduct)
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.OrganizationAdmin.quotes1,
    organizationName
  )
  quoteShouldbeVisibleTestCase(
    organizationName,
    quotes.Buyer2.quotes1,
    organizationName
  )
  quoteShouldNotBeVisibleTestCase(
    organizationName,
    organizationBQuote.OrganizationAdmin.quotes1,
    organizationB
  )
  searchQuote(quotes.OrganizationAdmin.quotes1)
  // rejectQuote(
  //   quotes.OrganizationAdmin2.declineQuote,
  //   ROLE_DROP_DOWN.OrganizationAdmin
  // )

  preserveCookie()
})
