import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  addPaymentTermsCollectionPriceTablesTestCase,
  setOrganizationIdInJSON,
} from '../../support/b2b/common.js'
import {
  addAddressinCostCenter,
  deleteCostCenter,
  addCostCenter,
  updateCostCenter,
  updatePaymentTermsinCostCenter,
} from '../../support/b2b/cost_center.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import { addUser } from '../../support/b2b/add_users.js'
import {
  ROLE_DROP_DOWN,
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  PAYMENT_TERMS,
} from '../../support/b2b/utils.js'
import {
  createQuote,
  // filterQuote,
  searchQuote,
} from '../../support/b2b/quotes.js'

describe('OrganizationA - Create a Buyer and Approver, associate Cost Center and assign payment terms', () => {
  loginViaCookies({ storeFrontCookie: false })

  const {
    organizationName,
    costCenter1,
    costCenter2,
    costCenter3,
    users,
    product,
    quotes,
    gmailCreds,
  } = b2b.OrganizationA

  loginToStoreFront(
    users.OrganizationAdmin1,
    ROLE_DROP_DOWN.OrganizationAdmin,
    gmailCreds
  )

  setOrganizationIdInJSON(organizationName, costCenter1.name)
  addPaymentTermsCollectionPriceTablesTestCase(b2b.OrganizationA)

  // CostCenter 2 - Scenarios
  addCostCenter(organizationName, costCenter2.name, costCenter2.addresses[0])
  updatePaymentTermsinCostCenter(
    organizationName,
    costCenter2.name,
    PAYMENT_TERMS.Promissory
  )
  addAddressinCostCenter(costCenter2.name, costCenter2.addresses[1])

  // // Cost Center 3 - Scenarios
  addCostCenter(
    organizationName,
    costCenter3.temporaryName,
    costCenter3.addresses[0]
  )
  updateCostCenter(costCenter3.temporaryName, costCenter3.name)
  deleteCostCenter(costCenter3.name)

  addUser({
    organizationName,
    costCenter: costCenter1.name,
    role: role.Buyer1,
    gmailCreds,
  })
  addUser({
    organizationName,
    costCenter: costCenter1.name,
    role: role.Approver1,
    gmailCreds,
  })

  addUser({
    organizationName,
    costCenter: costCenter2.name,
    role: role.Buyer2,
    gmailCreds,
  })

  // Add/Delete users in costcenter1 - Hold
  // Add/Update users for costcenter2 - Hold bug

  addUser({
    organizationName,
    costCenter: costCenter2.name,
    role: role.OrganizationAdmin2,
    gmailCreds,
  })
  addUser({
    organizationName,
    costCenter: costCenter2.name,
    role: role.Approver2,
    gmailCreds,
  })

  createQuote({
    product,
    quoteEnv: quotes.OrganizationAdmin.quotes1,
    role: ROLE_DROP_DOWN.OrganizationAdmin,
  })
  searchQuote(quotes.OrganizationAdmin.quotes1)
  // filterQuote(costCenter1.name)
  preserveCookie()
})
