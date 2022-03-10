import { testSetup } from '../../../cypress-template/common_support.js'
import {
  createOrganizationWithInvalidEmail,
  createOrganizationWithoutName,
  createOrganizationWithoutCostCenterNameAndAddress,
} from '../../support/b2b_organization_request_testcase.js'
import b2b from '../../support/b2b_constants.js'

describe('Organization Negative TestCases', () => {
  testSetup(false)
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
})
