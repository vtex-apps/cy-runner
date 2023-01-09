import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import {
  quickOrderByXLSNegativeTestCase2,
  quickOrderByXLSNegativeTestCase,
} from '../../support/quick-order/testcase.js'

describe('Quickorder - Upload CSV Negative testcase', () => {
  loginViaCookies()

  quickOrderByXLSNegativeTestCase(false)
  quickOrderByXLSNegativeTestCase2(false)

  preserveCookie()
})
