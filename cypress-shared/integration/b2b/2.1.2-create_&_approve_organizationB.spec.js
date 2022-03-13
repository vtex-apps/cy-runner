import { testSetup } from '../../support/common/common_support.js'
import { createAndApproveOrganizationRequestTestCase } from '../../support/b2b/organization_request.js'
import b2b from '../../support/b2b/constants.js'

describe('Create & Approve OrganizationB', () => {
  testSetup(false)

  createAndApproveOrganizationRequestTestCase(
    b2b.OrganizationB.organizationName,
    {
      costCenterName: b2b.OrganizationB.costCenter1.name,
      costCenterAddress: b2b.OrganizationB.costCenter1.addresses[0],
    },
    b2b.OrganizationB.users.OrganizationAdmin1
  )
})
