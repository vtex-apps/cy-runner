import { testSetup } from '../../support/common/support.js'
import { createOrganizationTestCase } from '../../support/b2b/organization_request.js'
import b2b from '../../support/b2b/constants.js'

describe('Create & Approve OrganizationB', () => {
  testSetup(false)

  // Create and decline Organization B
  createOrganizationTestCase(
    {
      name: b2b.OrganizationB.organizationName,
      email: b2b.OrganizationB.users.OrganizationAdmin1,
    },
    {
      costCenterName: b2b.OrganizationB.costCenter1.name,
      costCenterAddress: b2b.OrganizationB.costCenter1.addresses[0],
      declined: true,
    }
  )
})
