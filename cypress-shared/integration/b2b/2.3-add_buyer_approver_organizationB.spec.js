import { testSetup, preserveCookie } from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import {
  addPaymentTermsCollectionPriceTablesTestCase,
  setOrganizationIdInJSON,
} from '../../support/b2b/common.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import { addUser, duplicateUserTestCase } from '../../support/b2b/add_users.js'
import {
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  ROLE_DROP_DOWN,
} from '../../support/b2b/utils.js'
import { createQuote } from '../../support/b2b/quotes.js'

describe('OrganizationB - Create a Buyer and Approver associate Cost Center and assign payment terms', () => {
  testSetup(false)

  const { organizationName, costCenter1, users, product, quotes } =
    b2b.OrganizationB

  const { organizationName: organizationA } = b2b.OrganizationA

  loginToStoreFront(users.OrganizationAdmin1, ROLE_DROP_DOWN.OrganizationAdmin)
  setOrganizationIdInJSON(organizationName, costCenter1.name)
  addPaymentTermsCollectionPriceTablesTestCase(b2b.OrganizationB)
  addUser({ organizationName, costCenter: costCenter1.name, role: role.Buyer1 })
  addUser({
    organizationName,
    costCenter: costCenter1.name,
    role: role.Approver1,
  })
  duplicateUserTestCase({
    organizationName,
    costCenter: costCenter1.name,
    role: role.Approver1,
  })
  duplicateUserTestCase({
    organizationName: organizationA,
    costCenter: costCenter1.name,
    role: role.OrganizationAdmin1,
    sameOrganization: false,
  })
  createQuote({
    product,
    quoteEnv: quotes.OrganizationAdmin.quotes1,
    role: ROLE_DROP_DOWN.OrganizationAdmin,
  })
  preserveCookie()
})
