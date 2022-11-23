import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import { pack } from '../../support/packing-optimization/api_testcase'
import { packed } from '../../support/packing-optimization/outputvalidation'

describe('Rest-api-testcases', () => {
  loginViaCookies()

  pack(packed)

  preserveCookie()
})
