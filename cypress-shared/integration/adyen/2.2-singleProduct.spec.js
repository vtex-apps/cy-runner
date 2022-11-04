/* eslint-disable jest/expect-expect */
import {
  completePyamentWithDinersCard,
  startHandlingOrder,
  verifyOrderStatus,
} from '../../support/adyen/testcase'
import { singleProduct } from '../../support/common/outputvalidation'
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support'
import {
  getTestVariables,
  invoiceAPITestCase,
  sendInvoiceTestCase,
} from '../../support/common/testcase'

const { prefix, postalCode, productName, productQuantity } = singleProduct

const singleProductEnvs = getTestVariables(prefix)
const { orderIdEnv, transactionIdEnv } = singleProductEnvs

describe(`${prefix} scenarios`, () => {
  loginViaCookies()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName)
  })

  it(
    `In ${prefix} - Updating product quantity to ${productQuantity}`,
    updateRetry(4),
    () => {
      cy.updateProductQuantity(productName, {
        quantity: productQuantity,
        verifySubTotal: false,
      })
    }
  )

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(4), () => {
    // Update Shipping Section
    cy.updateShippingInformation({
      postalCode,
    })
  })

  completePyamentWithDinersCard(prefix, orderIdEnv)

  verifyOrderStatus({
    product: singleProduct,
    env: singleProductEnvs.orderIdEnv,
    status: 'ready-for-handling',
  })

  startHandlingOrder(singleProduct, singleProductEnvs.orderIdEnv)

  invoiceAPITestCase({
    product: singleProduct,
    env: orderIdEnv,
    transactionIdEnv,
  })

  sendInvoiceTestCase({ product: singleProduct, orderIdEnv })

  verifyOrderStatus({
    product: singleProduct,
    env: singleProductEnvs.orderIdEnv,
    status: 'invoiced',
  })

  preserveCookie()
})
