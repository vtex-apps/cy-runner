import { createAdyenWebhook } from '../../support/adyen/adyen_apis.js'
import {
  updateAdyenConnectorSettings,
  updateAdyenPlatformSettings,
} from '../../support/adyen/graphql.js'
import {
  verifyAdyenConnectorSettings,
  verifyAdyenPlatformSettings,
  createOnBoardingLink,
} from '../../support/adyen/testcase.js'
import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import { setWorkspaceAndGatewayAffiliations } from '../../support/common/testcase.js'

describe('Setting up adyen payments in dynamic environment', () => {
  loginViaCookies()

  updateAdyenConnectorSettings()
  verifyAdyenConnectorSettings()
  updateAdyenPlatformSettings()
  verifyAdyenPlatformSettings()
  createAdyenWebhook()
  setWorkspaceAndGatewayAffiliations({ afterAuthorization: true })
  createOnBoardingLink(true)

  preserveCookie()
})
