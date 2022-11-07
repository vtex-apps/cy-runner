/* eslint-disable jest/expect-expect */
import { loginViaCookies } from '../../support/common/support.js'
import {
  singleProduct,
  multiProduct,
  discountShipping,
  discountProduct,
  externalSeller,
  promotionProduct,
} from '../../support/common/outputvalidation'
import {
  getTestVariables,
  verifyTransactionPaymentsAPITestCase,
} from '../../support/common/testcase.js'
import { verifyOrderInAdyen } from '../../support/adyen/adyen_apis.js'
import { loginToAdyen } from '../../support/adyen/testcase.js'

describe(`Transaction Scenarios`, () => {
  loginViaCookies()

  loginToAdyen()

  const singleProductEnvs = getTestVariables(singleProduct.prefix)
  const multiProductEnvs = getTestVariables(multiProduct.prefix)
  const discountShippingEnvs = getTestVariables(discountShipping.prefix)
  const discountProductEnvs = getTestVariables(discountProduct.prefix)
  const externalSellerEnvs = getTestVariables(externalSeller.prefix)
  const promotionalProductEnvs = getTestVariables(promotionProduct.prefix)

  verifyTransactionPaymentsAPITestCase(singleProduct, singleProductEnvs)
  verifyTransactionPaymentsAPITestCase(multiProduct, multiProductEnvs)
  verifyTransactionPaymentsAPITestCase(discountProduct, discountProductEnvs)
  verifyTransactionPaymentsAPITestCase(discountShipping, discountShippingEnvs)
  verifyTransactionPaymentsAPITestCase(externalSeller, externalSellerEnvs)
  verifyTransactionPaymentsAPITestCase(promotionProduct, promotionalProductEnvs)

  verifyOrderInAdyen(singleProduct, singleProductEnvs)
  verifyOrderInAdyen(multiProduct, multiProductEnvs)
  verifyOrderInAdyen(discountProduct, discountProductEnvs)
  verifyOrderInAdyen(discountShipping, discountShippingEnvs)
  verifyOrderInAdyen(externalSeller, externalSellerEnvs)
  verifyOrderInAdyen(promotionProduct, promotionalProductEnvs)
})
