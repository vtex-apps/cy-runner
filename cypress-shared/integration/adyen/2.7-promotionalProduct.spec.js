/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { promotionProduct } from '../../support/common/outputvalidation.js'
import {
  getTestVariables,
  invoiceAPITestCase,
  sendInvoiceTestCase,
  startHandlingOrder,
  verifyOrderStatus,
} from '../../support/common/testcase'
import { completePyamentWithDinersCard } from '../../support/adyen/testcase.js'

describe('Promotional Product scenarios', () => {
  loginViaCookies()

  const { prefix, productName, postalCode, productQuantity } = promotionProduct

  const { orderIdEnv, transactionIdEnv } = getTestVariables(prefix)

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, { proceedtoCheckout: true })
  })

  it(`In ${prefix} - Updating product quantity to 2`, updateRetry(3), () => {
    // Update Product quantity to 1
    cy.updateProductQuantity(productName, {
      quantity: productQuantity,
      verifySubTotal: false,
    })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({ postalCode })
  })

  it(`In ${prefix} - Verify free product is added`, updateRetry(3), () => {
    // Verify free product is added
    cy.get('span[class="new-product-price"]')
      .first()
      .should('have.text', 'Free')
  })

  completePyamentWithDinersCard(prefix, orderIdEnv)

  verifyOrderStatus(orderIdEnv, 'ready-for-handling')

  startHandlingOrder(promotionProduct, orderIdEnv)

  verifyOrderStatus(orderIdEnv, 'handling')

  invoiceAPITestCase({
    product: promotionProduct,
    env: orderIdEnv,
    transactionIdEnv,
  })

  sendInvoiceTestCase({ product: promotionProduct, orderIdEnv })

  preserveCookie()
})
