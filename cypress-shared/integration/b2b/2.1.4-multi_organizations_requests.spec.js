import { loginViaCookies } from '../../support/common/support.js'
import {
  createOrganizationTestCase,
  requestOrganizationAndVerifyPopup,
  approveOrganization,
} from '../../support/b2b/organization_request.js'
import b2b, { OrganizationRequestStatus } from '../../support/b2b/constants.js'

describe('Create & Approve OrganizationB', () => {
  loginViaCookies({ storeFrontCookie: false })
  const email = b2b.OrganizationB.users.OrganizationAdmin1
  const name = b2b.OrganizationB.organizationName
  const costCenterName = b2b.OrganizationB.costCenter1.name
  const [costCenterAddress] = b2b.OrganizationB.costCenter1.addresses

  const organization = { name, email }
  const costCenter = {
    costCenterName,
    costCenterAddress,
  }

  // Create Organization B request
  createOrganizationTestCase(organization, costCenter)

  // Verify organization B in pending state
  requestOrganizationAndVerifyPopup(
    organization,
    costCenter,
    OrganizationRequestStatus.pending
  )

  // Approve Organization B
  approveOrganization(b2b.OrganizationB.organizationName)

  // Verify organization B in approved state
  requestOrganizationAndVerifyPopup(
    organization,
    costCenter,
    OrganizationRequestStatus.approved
  )
})
