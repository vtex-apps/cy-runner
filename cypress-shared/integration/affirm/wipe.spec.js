import { loginViaCookies } from '../../support/common/support.js'
import {
  startPaymentE2ETests,
  setWorkspaceAndGatewayAffiliations,
  deleteAddresses,
} from '../../support/common/testcase.js'

describe('Wipe affirm in dynamic environment', () => {
  loginViaCookies()

  startPaymentE2ETests()
  setWorkspaceAndGatewayAffiliations({ wipe: true })
  deleteAddresses()
})
