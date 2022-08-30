/* eslint-disable jest/expect-expect */
import { loginViaCookies } from '../../support/common/support.js'
import {
  singleProduct,
  multiProduct,
  discountShipping,
  discountProduct,
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

  verifyTransactionPaymentsAPITestCase(singleProduct, singleProductEnvs)
  verifyTransactionPaymentsAPITestCase(multiProduct, multiProductEnvs)
  verifyTransactionPaymentsAPITestCase(discountShipping, discountShippingEnvs)
  verifyTransactionPaymentsAPITestCase(discountProduct, discountProductEnvs)

  verifyTransactionInAffirm(singleProduct, singleProductEnvs)
  verifyTransactionInAffirm(multiProduct, multiProductEnvs)
  verifyTransactionInAffirm(discountShipping, discountShippingEnvs)
  verifyTransactionInAffirm(discountProduct, discountProductEnvs)

  /* 
  TODO: ExternalSeller shows popup randomly inside and outside the window
  So, for now we disabled this test 
  Once it is fixed then will enable again
  https://www.loom.com/share/efe711c4883243058989a712a62dadb9
  const externalSellerEnvs = getTestVariables(externalSeller.prefix)
  verifyTransactionPaymentsAPITestCase(externalSeller, externalSellerEnvs)
  verifyTransactionInAffirm(externalSeller, externalSellerEnvs)
  */
})
