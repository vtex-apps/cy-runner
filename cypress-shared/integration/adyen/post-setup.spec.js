import {
  updateAdyenConnectorSettings,
  updateAdyenPlatformSettings,
} from '../../support/adyen/graphql.js'
import {
  verifyAdyenConnectorSettings,
  verifyAdyenPlatformSettings,
} from '../../support/adyen/testcase.js'
import { loginViaCookies } from '../../support/common/support.js'
import { setWorkspaceAndGatewayAffiliations } from '../../support/common/testcase.js'

describe('Setting up adyen payments in dynamic environment', () => {
  loginViaCookies()

  updateAdyenConnectorSettings({ useAdyenPlatforms: true })
  verifyAdyenConnectorSettings()
  updateAdyenPlatformSettings()
  verifyAdyenPlatformSettings()
  setWorkspaceAndGatewayAffiliations()
})
