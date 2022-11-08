import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import { getAllAccount, Adyenhook } from '../../support/adyen/api_testcase'
import { hook, sellerAccount } from '../../support/adyen/outputvalidation'

describe('Rest-api-testcases', () => {
  loginViaCookies()

  getAllAccount(sellerAccount)

  Adyenhook(hook)

  preserveCookie()
})
