/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  updateRetry,
  preserveCookie,
} from '../../support/common/support.js'
import { multiProduct } from '../../support/common/outputvalidation'
import {
  completePyamentWithDinersCard,
  startHandlingOrder,
  verifyOrderStatus,
} from '../../support/adyen/testcase'
import {
  getTestVariables,
  invoiceAPITestCase,
  sendInvoiceTestCase,
} from '../../support/common/testcase'

const { prefix, product1Name, product2Name, postalCode, productQuantity } =
  multiProduct

const { orderIdEnv, transactionIdEnv } = getTestVariables(prefix)

describe('Multi Product Testcase', () => {
  loginViaCookies()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(product1Name)
    // Add product to cart
    cy.addProduct(product1Name, { proceedtoCheckout: false })
    // Search the product
    cy.searchProduct(product2Name)
    // Add product to cart
    cy.addProduct(product2Name, {
      proceedtoCheckout: true,
    })
  })

  it(`In ${prefix} - Updating product quantity to 2`, updateRetry(3), () => {
    // Update Product quantity to 2
    cy.updateProductQuantity(product1Name, {
      quantity: productQuantity,
      verifySubTotal: false,
    })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({ postalCode })
  })

  completePyamentWithDinersCard(prefix, orderIdEnv)

  verifyOrderStatus({
    product: multiProduct,
    env: orderIdEnv,
    status: 'ready-for-handling',
  })

  startHandlingOrder(multiProduct, orderIdEnv)

  verifyOrderStatus({
    product: multiProduct,
    env: orderIdEnv,
    status: 'handling',
  })

  invoiceAPITestCase({
    product: multiProduct,
    env: orderIdEnv,
    transactionIdEnv,
  })

  sendInvoiceTestCase({ product: multiProduct, orderIdEnv })

  verifyOrderStatus({
    product: multiProduct,
    env: orderIdEnv,
    status: 'invoiced',
  })

  preserveCookie()
})
