/* eslint-disable jest/expect-expect */
import { loginViaCookies } from '../../support/common/support.js'
import {
  singleProduct,
  multiProduct,
  discountShipping,
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
  const discountShippingEnvs = getTestVariables(discountShipping.prefix)

  verifyTransactionPaymentsAPITestCase(singleProduct, singleProductEnvs)
  verifyTransactionPaymentsAPITestCase(multiProduct, multiProductEnvs)
  verifyTransactionPaymentsAPITestCase(discountShipping, discountShippingEnvs)

  verifyTransactionInAffirm(singleProduct, singleProductEnvs)
  verifyTransactionInAffirm(multiProduct, multiProductEnvs)
  verifyTransactionInAffirm(discountShipping, discountShippingEnvs)
})
