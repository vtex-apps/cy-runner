import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import {
  quickOrderBySkuAndQuantityWithValidAndInValidSkuTestCase,
  quickOrderBySkuAnd51QuantityTestCase,
} from '../../support/quick-order/testcase.js'

describe('Quickorder - SkuCode Quantity Negative testcases', () => {
  loginViaCookies()

  quickOrderBySkuAndQuantityWithValidAndInValidSkuTestCase('user', null)
  quickOrderBySkuAnd51QuantityTestCase('user', null)

  preserveCookie()
})
