import {
  deleteAdyenWebhook,
  deleteAccountHoldersFromMasterData,
} from '../../support/adyen/adyen_apis.js'
import { loginViaCookies } from '../../support/common/support.js'
import { setWorkspaceAndGatewayAffiliations } from '../../support/common/testcase.js'

describe('Wipe Adyen in dynamic environment', () => {
  loginViaCookies()

  setWorkspaceAndGatewayAffiliations({ wipe: true })
  deleteAdyenWebhook()
  deleteAccountHoldersFromMasterData()
})
