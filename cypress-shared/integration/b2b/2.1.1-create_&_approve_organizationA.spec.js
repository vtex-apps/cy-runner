import { testSetup } from '../../support/common/support.js'
import { createAndApproveOrganizationRequestTestCase } from '../../support/b2b/organization_request.js'
import b2b, { OrganizationRequestStatus } from '../../support/b2b/constants.js'

describe('Create & Approve OrganizationA', () => {
  testSetup(false)
  const emailId = b2b.OrganizationA.users.OrganizationAdmin1

  createAndApproveOrganizationRequestTestCase(
    { name: b2b.OrganizationA.organizationName, email: emailId },
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    OrganizationRequestStatus.approved
  )
})
