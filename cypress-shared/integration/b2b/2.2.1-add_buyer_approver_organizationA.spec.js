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
import { ROLE_DROP_DOWN, PAYMENT_TERMS } from '../../support/b2b/utils.js'
import { verifyBindings } from '../../support/b2b/graphql.js'

describe('OrganizationA - Create a Buyer and Approver, associate Cost Center and assign payment terms', () => {
  loginViaCookies({ storeFrontCookie: false })

  const { organizationName, costCenter1, costCenter2, costCenter3, users } =
    b2b.OrganizationA

  verifyBindings(users.OrganizationAdmin1.email, true)

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

  // // Cost Center 3 - Scenarios
  addCostCenter(
    organizationName,
    costCenter3.temporaryName,
    costCenter3.addresses[0]
  )
  updateCostCenter(costCenter3.temporaryName, costCenter3.name)
  deleteCostCenter(costCenter3.name)

  preserveCookie()
})
