/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { singleProduct } from '../../support/affirm/outputvalidation'
import {
  sendInvoiceTestCase,
  invoiceAPITestCase,
  getTestVariables,
} from '../../support/common/testcase.js'
import {
  completePayment,
  InitiatePayment,
} from '../../support/affirm/affirm.js'

const { prefix, productName, postalCode } = singleProduct

const { orderIdEnv, transactionIdEnv } = getTestVariables(prefix)

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, { proceedtoCheckout: true })
  })

  it('Updating product quantity to 2', updateRetry(3), () => {
    // Update Product quantity to 2
    cy.updateProductQuantity(productName, {
      quantity: '2',
      verifySubTotal: false,
    })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({
      postalCode,
      phoneNumber: '(312) 310 3249',
      timeout: 10000,
    })
  })

  it(`In ${prefix} - Initiate payment`, updateRetry(3), () => {
    InitiatePayment()
  })

  it(`In ${prefix} - Complete payment`, () => {
    completePayment(prefix)
  })

  sendInvoiceTestCase(singleProduct, orderIdEnv)

  // Get transactionId from invoiceAPI and store in .orders.json
  invoiceAPITestCase({
    product: singleProduct,
    env: orderIdEnv,
    transactionIdEnv,
  })

  preserveCookie()
})
