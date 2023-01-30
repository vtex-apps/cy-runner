/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import { discountShipping } from '../../support/adyen/outputvalidation'
import { completePaymentWithDinersCard } from '../../support/adyen/testcase.js'
import {
  getTestVariables,
  checkoutProduct,
} from '../../support/common/testcase.js'

const { prefix } = discountShipping

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  const { orderIdEnv } = getTestVariables(prefix)

  checkoutProduct(discountShipping)

  completePaymentWithDinersCard(prefix, orderIdEnv)

  preserveCookie()
})
