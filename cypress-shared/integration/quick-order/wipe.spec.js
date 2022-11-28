import { loginViaCookies } from '../../support/common/support.js'
import { deleteAddresses } from '../../support/common/testcase.js'

describe('Wipe addresses in dynamic environment', () => {
  loginViaCookies()

  deleteAddresses()
})
