import {
  testSetup,
  preserveCookie,
} from '../../support/common/common_support.js'
import b2b from '../../support/b2b/constants.js'
import {
  addPaymentTermsCollectionPriceTablesTestCase,
  setOrganizationIdInJSON,
} from '../../support/b2b/common.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import { addUser } from '../../support/b2b/add_users.js'
import {
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
  ROLE_DROP_DOWN,
} from '../../support/b2b/utils.js'

describe('OrganizationB - Create a Buyer associate Cost Center and assign payment terms', () => {
  testSetup(false)

  const { organizationName, costCenter1, users } = b2b.OrganizationB

  loginToStoreFront(users.OrganizationAdmin1, ROLE_DROP_DOWN.OrganizationAdmin)
  setOrganizationIdInJSON(organizationName, costCenter1.name)
  addPaymentTermsCollectionPriceTablesTestCase(b2b.OrganizationB)
  addUser(organizationName, costCenter1.name, role.Buyer1)
  addUser(organizationName, costCenter1.name, role.Approver1)
  preserveCookie()
})
