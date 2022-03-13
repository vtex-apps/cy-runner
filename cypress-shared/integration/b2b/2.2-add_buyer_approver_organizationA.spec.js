import {
  testSetup,
  preserveCookie,
} from '../../support/common/common_support.js'
import b2b from '../../support/b2b/b2b_constants.js'
import {
  addPaymentTermsCollectionPriceTablesTestCase,
  setOrganizationIdInJSON,
} from '../../support/b2b/b2b_common_testcase.js'
import {
  addAddressinCostCenter,
  deleteCostCenter,
  addCostCenter,
  updateCostCenter,
  updatePaymentTermsinCostCenter,
} from '../../support/b2b/b2b_cost_center_testcase.js'
import { loginToStoreFront } from '../../support/b2b/b2b_login.js'
import {
  addUser,
  addAndupdateUser,
} from '../../support/b2b/b2b_add_users_testcase.js'
import {
  ROLE_DROP_DOWN,
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  PAYMENT_TERMS,
} from '../../support/b2b/b2b_utils.js'

describe('OrganizationA - Create a Buyer and Approver, associate Cost Center and assign payment terms', () => {
  testSetup(false)

  const { organizationName, costCenter1, costCenter2, costCenter3, users } =
    b2b.OrganizationA

  loginToStoreFront(users.OrganizationAdmin1, ROLE_DROP_DOWN.OrganizationAdmin)

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

  // Cost Center 3 - Scenarios
  addCostCenter(
    organizationName,
    costCenter3.temporaryName,
    costCenter3.addresses[0]
  )
  updateCostCenter(costCenter3.temporaryName, costCenter3.name)
  deleteCostCenter(costCenter3.name)

  // Add/Delete users in costcenter1
  addUser(organizationName, costCenter1.name, role.Buyer1)
  addUser(organizationName, costCenter1.name, role.Approver1)

  // Add/Update users for costcenter2
  addAndupdateUser(
    organizationName,
    { currentCostCenter: costCenter1.name, updateCostCenter: costCenter2.name },
    { currentRole: role.OrganizationAdmin2, updatedRole: role.Buyer2 }
  )
  addUser(organizationName, costCenter2.name, role.OrganizationAdmin2)
  addUser(organizationName, costCenter2.name, role.Approver2)

  preserveCookie()
})
