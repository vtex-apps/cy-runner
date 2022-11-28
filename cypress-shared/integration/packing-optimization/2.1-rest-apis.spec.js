import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import { pack } from '../../support/packing-optimization/api_testcase'
import { packed } from '../../fixtures/pack.json'

describe('Rest-api-testcases', () => {
  loginViaCookies()

  pack(packed)

  preserveCookie()
})
