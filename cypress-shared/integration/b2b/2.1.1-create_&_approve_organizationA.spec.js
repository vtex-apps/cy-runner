import { testSetup } from '../../support/common/support.js'
import { createOrganizationTestCase } from '../../support/b2b/organization_request.js'
import b2b from '../../support/b2b/constants.js'
import { deleteOrganization } from '../../support/b2b/graphql.js'

describe('Create & Approve OrganizationA', () => {
  testSetup(false)

  const { organizationName, costCenter1, users } = b2b.OrganizationA

  deleteOrganization(organizationName, true)
  deleteOrganization(organizationName)

  // Create and approve Organization A request
  createOrganizationTestCase(
    {
      name: organizationName,
      email: users.OrganizationAdmin1,
    },
    {
      costCenterName: costCenter1.name,
      costCenterAddress: costCenter1.addresses[0],
      approved: true,
    }
  )
  
  it("It should trigger an error", => {
     throw new Error("Testing Jira integration")
  })
})
