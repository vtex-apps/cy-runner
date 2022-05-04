import { testSetup } from '../../support/common/support.js'
import { createOrganizationTestCase } from '../../support/b2b/organization_request.js'
import b2b from '../../support/b2b/constants.js'

describe('Create & Approve OrganizationA', () => {
  testSetup(false)
  const emailId = b2b.OrganizationA.users.OrganizationAdmin1

  // Create and approve Organization A request
  createOrganizationTestCase(
    {
      name: b2b.OrganizationA.organizationName,
      email: emailId,
    },
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
      approved: true,
    }
  )
})
