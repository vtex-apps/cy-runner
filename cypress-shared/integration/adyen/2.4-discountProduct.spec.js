/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { discountProduct } from '../../support/affirm/outputvalidation'
import {
  getTestVariables,
  invoiceAPITestCase,
  sendInvoiceTestCase,
  startHandlingOrder,
  verifyOrderStatus,
} from '../../support/common/testcase.js'
import { completePyamentWithDinersCard } from '../../support/adyen/testcase.js'
import selectors from '../../support/common/selectors.js'

const { prefix, productName, postalCode, productQuantity, totalAmount } =
  discountProduct

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  const { orderIdEnv, transactionIdEnv } = getTestVariables(prefix)

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(1), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, { proceedtoCheckout: true })
  })

  it(`In ${prefix} - Updating product quantity to 1`, updateRetry(4), () => {
    // Update Product quantity to 1
    cy.updateProductQuantity(productName, {
      quantity: productQuantity,
      verifySubTotal: false,
    })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(4), () => {
    // Update Shipping Section
    cy.updateShippingInformation({ postalCode })
  })

  it(`In ${prefix} - Verifying total amounts and discount for a discounted product`, () => {
    // Verify Total
    cy.verifyTotal(totalAmount)
    // Verify Discounts
    cy.get(selectors.Discounts).last().should('be.visible')
  })

  completePyamentWithDinersCard(prefix, orderIdEnv)

  verifyOrderStatus({
    product: discountProduct,
    env: orderIdEnv,
    status: 'ready-for-handling',
  })

  startHandlingOrder(discountProduct, orderIdEnv)

  verifyOrderStatus({
    product: discountProduct,
    env: orderIdEnv,
    status: 'handling',
  })

  invoiceAPITestCase({
    product: discountProduct,
    env: orderIdEnv,
    transactionIdEnv,
  })

  sendInvoiceTestCase({ product: discountProduct, orderIdEnv })

  verifyOrderStatus({
    product: discountProduct,
    env: orderIdEnv,
    status: 'invoiced',
  })

  preserveCookie()
})
