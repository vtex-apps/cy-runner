import { testSetup } from '../../support/common/support.js'
import {
  createOrganizationWithInvalidEmail,
  createOrganizationWithoutName,
  createOrganizationWithoutCostCenterNameAndAddress,
} from '../../support/b2b/organization_request.js'
import b2b from '../../support/b2b/constants.js'

describe('Organization Negative TestCases', () => {
  testSetup(false)
  const email = b2b.OrganizationA.users.OrganizationAdmin1

  createOrganizationWithoutCostCenterNameAndAddress(
    b2b.OrganizationA.organizationName,
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    email
  )

  createOrganizationWithoutName(
    b2b.OrganizationA.organizationName,
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    email
  )
  createOrganizationWithInvalidEmail(
    b2b.OrganizationA.organizationName,
    {
      costCenterName: b2b.OrganizationA.costCenter1.name,
      costCenterAddress: b2b.OrganizationA.costCenter1.addresses[0],
    },
    email
  )
})
