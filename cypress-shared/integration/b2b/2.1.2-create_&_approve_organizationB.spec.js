import { testSetup } from '../../support/common/support.js'
import { createOrganizationTestCase } from '../../support/b2b/organization_request.js'
import b2b from '../../support/b2b/constants.js'
import { deleteOrganization } from '../../support/b2b/graphql.js'

describe('Create & Approve OrganizationB', () => {
  testSetup(false)

  const {
    organizationName,
    costCenter1,
    users,
    tradeName,
    phoneNumber,
    businessDocument,
  } = b2b.OrganizationB

  deleteOrganization(organizationName, true)
  deleteOrganization(organizationName)

  // Create and approve Organization B
  createOrganizationTestCase(
    {
      name: organizationName,
      email: users.OrganizationAdmin1,
      tradeName,
    },
    {
      costCenterName: costCenter1.name,
      costCenterAddress: costCenter1.addresses[0],
      phoneNumber,
      businessDocument,
      approved: true,
    }
  )
})
