import { loginViaCookies } from '../../support/common/support.js'
import {
  startPaymentE2ETests,
  setWorkspaceAndGatewayAffiliations,
  syncCheckoutUICustomAPI,
} from '../../support/common/testcase.js'

describe('Setting up affirm in dynamic environment', () => {
  loginViaCookies()

  startPaymentE2ETests()
  setWorkspaceAndGatewayAffiliations()
  syncCheckoutUICustomAPI()
})
