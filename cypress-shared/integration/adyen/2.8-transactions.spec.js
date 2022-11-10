/* eslint-disable jest/expect-expect */
import { loginViaCookies } from '../../support/common/support.js'
import {
  singleProduct,
  multiProduct,
  discountShipping,
  discountProduct,
  // externalSeller,
  promotionProduct,
} from '../../support/common/outputvalidation'
import { getTestVariables } from '../../support/common/testcase.js'
import {
  loginToAdyen,
  verifyProductInvoiceTestcase,
} from '../../support/adyen/testcase.js'

describe(`Transaction Scenarios`, () => {
  loginViaCookies()

  loginToAdyen()

  const singleProductEnvs = getTestVariables(singleProduct.prefix)
  const multiProductEnvs = getTestVariables(multiProduct.prefix)
  const discountShippingEnvs = getTestVariables(discountShipping.prefix)
  const discountProductEnvs = getTestVariables(discountProduct.prefix)
  // const externalSellerEnvs = getTestVariables(externalSeller.prefix)
  const promotionalProductEnvs = getTestVariables(promotionProduct.prefix)

  // single product
  verifyProductInvoiceTestcase(singleProduct, singleProductEnvs)

  // multi product
  verifyProductInvoiceTestcase(multiProduct, multiProductEnvs)

  // discount product
  verifyProductInvoiceTestcase(discountProduct, discountProductEnvs)

  // discount shipping product
  verifyProductInvoiceTestcase(discountShipping, discountShippingEnvs)

  // promotional product
  verifyProductInvoiceTestcase(promotionProduct, promotionalProductEnvs)

  // external sellet product
  // TODO - Enable this after verifying it is working fine
  // verifyProductInvoiceTestcase(externalSeller, externalSellerEnvs, true)
})
