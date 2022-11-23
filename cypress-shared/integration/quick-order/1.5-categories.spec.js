import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import {
  quickOrderByCategoryNegativeTestCase,
  quickOrderByCategory,
} from '../../support/quick-order/testcase.js'

describe('Quickorder - Category testcases', () => {
  loginViaCookies()

  quickOrderByCategory('user', null)
  quickOrderByCategoryNegativeTestCase('user', null)

  preserveCookie()
})
