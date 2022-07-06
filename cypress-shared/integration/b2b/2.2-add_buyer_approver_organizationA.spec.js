import { testSetup, preserveCookie } from '../../support/common/support.js'
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

describe('OrganizationA - Create a Buyer and Approver, associate Cost Center and assign payment terms', () => {
  testSetup(false)

  const {
    organizationName,
    costCenter1,
    costCenter2,
    costCenter3,
    users,
    // product,
    // quotes,
  } = b2b.OrganizationA

  loginToStoreFront(users.OrganizationAdmin1, ROLE_DROP_DOWN.OrganizationAdmin)

  setOrganizationIdInJSON(organizationName, costCenter1.name)
  addPaymentTermsCollectionPriceTablesTestCase(b2b.OrganizationA)

  // CostCenter 2 - Scenarios
  addCostCenter(
    organizationName,
    costCenter2.name,
    costCenter2.addresses[0],
    costCenter2.phoneNumber,
    costCenter2.businessDocument
  )
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

  addUser({ organizationName, costCenter: costCenter1.name, role: role.Buyer1 })
  addUser({
    organizationName,
    costCenter: costCenter1.name,
    role: role.Approver1,
  })

  addUser({ organizationName, costCenter: costCenter2.name, role: role.Buyer2 })

  // Add/Delete users in costcenter1 - Hold
  // Add/Update users for costcenter2 - Hold bug

  addUser({
    organizationName,
    costCenter: costCenter2.name,
    role: role.OrganizationAdmin2,
  })
  addUser({
    organizationName,
    costCenter: costCenter2.name,
    role: role.Approver2,
  })
  preserveCookie()
})
