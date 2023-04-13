import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import b2b from '../../support/b2b/constants.js'
import { loginToStoreFront } from '../../support/b2b/login.js'
import { addUser } from '../../support/b2b/add_users.js'
import {
  ROLE_DROP_DOWN,
  ROLE_DROP_DOWN_EMAIL_MAPPING as role,
} from '../../support/b2b/utils.js'
import {
  createQuote,
  // filterQuote,
  searchQuote,
} from '../../support/b2b/quotes.js'
import { verifyBindings } from '../../support/b2b/graphql.js'

describe('OrganizationA - Create a Buyer and Approver, associate Cost Center and assign payment terms', () => {
  loginViaCookies({ storeFrontCookie: false })

  const { organizationName, costCenter1, costCenter2, users, product, quotes } =
    b2b.OrganizationA

  verifyBindings(users.OrganizationAdmin1.email, true)

  loginToStoreFront(users.OrganizationAdmin1, ROLE_DROP_DOWN.OrganizationAdmin)

  addUser({
    organizationName,
    costCenter: costCenter1.name,
    role: role.Buyer1,
    email: users.Buyer1.email,
  })
  addUser({
    organizationName,
    costCenter: costCenter1.name,
    role: role.Approver1,
    email: users.Approver1.email,
  })

  addUser({
    organizationName,
    costCenter: costCenter2.name,
    role: role.Buyer2,
    email: users.Buyer2.email,
  })

  // Add/Delete users in costcenter1 - Hold
  // Add/Update users for costcenter2 - Hold bug

  addUser({
    organizationName,
    costCenter: costCenter2.name,
    role: role.OrganizationAdmin2,
    email: users.OrganizationAdmin2.email,
  })
  addUser({
    organizationName,
    costCenter: costCenter2.name,
    role: role.Approver2,
    email: users.Approver2.email,
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
