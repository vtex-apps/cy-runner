import {
  updateAdyenConnectorSettings,
  updateAdyenPlatformSettings,
} from '../../support/adyen/graphql.js'
import { loginViaCookies } from '../../support/common/support.js'
import { setWorkspaceAndGatewayAffiliations } from '../../support/common/testcase.js'

describe('Setting up affirm in dynamic environment', () => {
  loginViaCookies()

  updateAdyenConnectorSettings()
  updateAdyenPlatformSettings()
  setWorkspaceAndGatewayAffiliations()
})
