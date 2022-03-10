import { testSetup } from '../../../cypress-template/common_support.js'
import { createAndApproveOrganizationRequestTestCase } from '../../support/b2b_organization_request_testcase.js'
import b2b from '../../support/b2b_constants.js'

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
