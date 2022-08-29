/* eslint-disable jest/expect-expect */
import { loginViaCookies } from '../../support/common/support.js'
import { singleProduct } from '../../support/affirm/outputvalidation'
import { verifyTransactionPaymentsAPITestCase } from '../../support/common/testcase.js'
import { getTestVariables } from '../../support/affirm/affirm'
import { verifyTransactionInAffirm } from '../../support/affirm/api_testcase.js'

describe(`Transaction Scenarios`, () => {
  loginViaCookies()

  const singleProductEnvs = getTestVariables(singleProduct.prefix)

  verifyTransactionPaymentsAPITestCase(singleProductEnvs)
  verifyTransactionInAffirm(singleProduct, singleProductEnvs)
})
