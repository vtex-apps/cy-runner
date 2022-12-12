import { loginViaCookies } from '../../support/common/support.js'
import {
  setWorkspaceAndGatewayAffiliations,
  deleteAddresses,
} from '../../support/common/testcase.js'

describe('Wipe affirm in dynamic environment', () => {
  loginViaCookies()

  setWorkspaceAndGatewayAffiliations({ wipe: true })
  deleteAddresses()
})
