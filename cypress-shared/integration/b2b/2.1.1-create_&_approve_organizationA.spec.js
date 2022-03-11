import { testSetup } from '../../support/cypress-template/common_support.js'
import { createAndApproveOrganizationRequestTestCase } from '../../support/b2b_organization_request_testcase.js'
import b2b from '../../support/b2b_constants.js'

describe('Create & Approve OrganizationA', () => {
  testSetup(false)
  const emailId = b2b.OrganizationA.users.OrganizationAdmin1

  createAndApproveOrganizationRequestTestCase(
    b2b.OrganizationA.organizationName,
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    emailId
  )
})