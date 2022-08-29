/* eslint-disable jest/expect-expect */
import { loginViaCookies } from '../../support/common/support.js'
import {
  singleProduct,
  multiProduct,
} from '../../support/affirm/outputvalidation'
import {
  verifyTransactionPaymentsAPITestCase,
  getTestVariables,
} from '../../support/common/testcase.js'
import { verifyTransactionInAffirm } from '../../support/affirm/api_testcase.js'

describe(`Transaction Scenarios`, () => {
  loginViaCookies()

  const singleProductEnvs = getTestVariables(singleProduct.prefix)
  const multiProductEnvs = getTestVariables(multiProduct.prefix)

  verifyTransactionPaymentsAPITestCase(singleProduct.singleProductEnvs)
  verifyTransactionInAffirm(singleProduct, singleProductEnvs)

  verifyTransactionPaymentsAPITestCase(multiProduct, multiProductEnvs)
  verifyTransactionInAffirm(multiProduct, multiProductEnvs)
})
