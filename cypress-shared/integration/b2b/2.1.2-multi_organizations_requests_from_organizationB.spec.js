import { loginViaCookies } from '../../support/common/support.js'
import {
  createOrganizationTestCase,
  approveOrganization,
} from '../../support/b2b/organization_request.js'
import b2b from '../../support/b2b/constants.js'
import { deleteOrganization } from '../../support/b2b/graphql.js'

describe('Create, Decline OrganizationB', () => {
  before(() => {
    cy.clearLocalStorage()
  })
  loginViaCookies({ storeFrontCookie: false })
  const email = b2b.OrganizationB.users.OrganizationAdmin1
  const name = b2b.OrganizationB.organizationName
  const costCenterName = b2b.OrganizationB.costCenter1.name
  const [costCenterAddress] = b2b.OrganizationB.costCenter1.addresses

  const organization = { name, email }
  const costCenter = {
    costCenterName,
    costCenterAddress,
  }

  const { organizationName, costCenter1, users } = b2b.OrganizationB

  deleteOrganization(organizationName, true)
  deleteOrganization(organizationName)

  // Create and decline Organization B
  createOrganizationTestCase(
    {
      name: organizationName,
      email: users.OrganizationAdmin1,
    },
    {
      costCenterName: costCenter1.name,
      costCenterAddress: costCenter1.addresses[0],
      declined: true,
    }
  )

  describe('Create, Approve OrganizationB', () => {
    // Create Organization B request
    createOrganizationTestCase(organization, costCenter)

    // Approve Organization B
    approveOrganization(b2b.OrganizationB.organizationName)
  })
})
