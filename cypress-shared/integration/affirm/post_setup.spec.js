import { loginViaCookies } from '../../support/common/support.js'
import {
  setWorkspaceAndGatewayAffiliations,
  syncCheckoutUICustom,
} from '../../support/common/testcase.js'

describe('Setting up affirm in dynamic environment', () => {
  loginViaCookies()

  setWorkspaceAndGatewayAffiliations()
  syncCheckoutUICustom()
})
