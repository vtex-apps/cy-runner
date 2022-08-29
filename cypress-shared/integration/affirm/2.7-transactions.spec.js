/* eslint-disable jest/expect-expect */
import { loginViaCookies } from '../../support/common/support.js'
import {
  singleProduct,
  multiProduct,
  discountShipping,
  discountProduct,
  externalSeller,
} from '../../support/affirm/outputvalidation'
import {
  getTestVariables,
  verifyTransactionPaymentsAPITestCase,
} from '../../support/common/testcase.js'
import { verifyTransactionInAffirm } from '../../support/affirm/api_testcase.js'

describe(`Transaction Scenarios`, () => {
  loginViaCookies()

  const singleProductEnvs = getTestVariables(singleProduct.prefix)
  const multiProductEnvs = getTestVariables(multiProduct.prefix)
  const discountShippingEnvs = getTestVariables(discountShipping.prefix)
  const discountProductEnvs = getTestVariables(discountProduct.prefix)
  const externalSellerEnvs = getTestVariables(externalSeller.prefix)

  verifyTransactionPaymentsAPITestCase(singleProduct, singleProductEnvs)
  verifyTransactionPaymentsAPITestCase(multiProduct, multiProductEnvs)
  verifyTransactionPaymentsAPITestCase(discountShipping, discountShippingEnvs)
  verifyTransactionPaymentsAPITestCase(discountProduct, discountProductEnvs)
  verifyTransactionPaymentsAPITestCase(externalSeller, externalSellerEnvs)

  verifyTransactionInAffirm(singleProduct, singleProductEnvs)
  verifyTransactionInAffirm(multiProduct, multiProductEnvs)
  verifyTransactionInAffirm(discountShipping, discountShippingEnvs)
  verifyTransactionInAffirm(discountProduct, discountProductEnvs)
  verifyTransactionInAffirm(externalSeller, externalSellerEnvs)
})
