import { testSetup } from '../../support/cypress-template/common_support.js'
import {
  setupForOrganizationRequest,
  createAndApproveOrganizationRequestTestCase,
  createOrganizationWithInvalidEmail,
  createOrganizationWithoutName,
  createOrganizationWithoutCostCenterNameAndAddress,
} from '../../support/b2b_organization_request_testcase.js'
import b2b from '../../support/b2b_constants.js'
import { getVtexItems } from '../../support/cypress-template/utils.js'

describe('Create & Approve OrganizationA', () => {
  testSetup(false, false)
  setupForOrganizationRequest()
  const emailId = b2b.OrganizationA.users.OrganizationAdmin1
  createOrganizationWithoutCostCenterNameAndAddress(
    b2b.OrganizationA.organizationName,
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    emailId
  )
  createOrganizationWithoutName(
    b2b.OrganizationA.organizationName,
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    emailId
  )
  createOrganizationWithInvalidEmail(
    b2b.OrganizationA.organizationName,
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    emailId
  )
  createAndApproveOrganizationRequestTestCase(
    b2b.OrganizationA.organizationName,
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    emailId
  )
  // })
  // describe('Create & Approve OrganizationB', () => {
  createAndApproveOrganizationRequestTestCase(
    b2b.OrganizationB.organizationName,
    {
      costCenterName: b2b.OrganizationB.costCenter1.name,
      costCenterAddress: b2b.OrganizationB.costCenter1.addresses[0],
    },
    b2b.OrganizationB.users.OrganizationAdmin1
  )
})
