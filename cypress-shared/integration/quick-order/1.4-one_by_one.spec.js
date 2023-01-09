import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import {
  quickOrderByOneByOneTestCase,
  quickOrderByOneByOneNegativeTestCase,
} from '../../support/quick-order/testcase.js'
import { PRODUCTS } from '../../support/common/utils.js'

describe('Quickorder - Category testcases', () => {
  loginViaCookies()

  quickOrderByOneByOneTestCase('user', PRODUCTS.coconut, null)
  quickOrderByOneByOneNegativeTestCase('user', PRODUCTS.coconut, null)

  preserveCookie()
})
