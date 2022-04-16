import { testSetup } from '../../support/common/support.js'
import {
  createAndApproveOrganizationRequestAndVerifyTestCase,
  createAndApproveOrganizationRequestTestCase,
} from '../../support/b2b/organization_request.js'
import b2b, { OrganizationRequestStatus } from '../../support/b2b/constants.js'

describe('Create & Approve OrganizationA', () => {
  testSetup(false)
  const orgAEmail = b2b.OrganizationA.users.OrganizationAdmin1
  const orgBEmail = b2b.OrganizationB.users.OrganizationAdmin1

  createAndApproveOrganizationRequestAndVerifyTestCase(
    { name: b2b.OrganizationA.organizationName, email: orgAEmail },
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    OrganizationRequestStatus.approved
  )

  createAndApproveOrganizationRequestTestCase(
    { name: b2b.OrganizationB.organizationName, email: orgBEmail },
    {
      costCenterName: b2b.OrganizationB.costCenter1.name,
      costCenterAddress: b2b.OrganizationB.costCenter1.addresses[0],
    },
    OrganizationRequestStatus.pending
  )

  createAndApproveOrganizationRequestAndVerifyTestCase(
    { name: b2b.OrganizationB.organizationName, email: orgBEmail },
    {
      costCenterName: b2b.OrganizationB.costCenter1.name,
      costCenterAddress: b2b.OrganizationB.costCenter1.addresses[0],
    },
    OrganizationRequestStatus.pending
  )
})
