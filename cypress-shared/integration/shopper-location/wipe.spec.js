/* eslint-disable jest/valid-expect */
import { deleteAddresses } from '../../support/common/testcase.js'
import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'

describe('Wipe the pickup points', () => {
  loginViaCookies()

  deleteAddresses()

  preserveCookie()
})
