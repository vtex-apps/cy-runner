import { loginViaCookies } from '../../support/common/support.js'
import {
  setWorkspaceAndGatewayAffiliations,
  startPaymentE2ETests,
  syncCheckoutUICustom,
} from '../../support/common/testcase.js'

describe('Setting up affirm in dynamic environment', () => {
  loginViaCookies()

  startPaymentE2ETests()
  setWorkspaceAndGatewayAffiliations()
  syncCheckoutUICustom()
})
