/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { singleProduct } from '../../support/affirm/outputvalidation'
import { getTestVariables } from '../../support/common/testcase.js'
import { completeThePayment } from '../../support/affirm/testcase.js'

const { prefix, productName, postalCode, productQuantity } = singleProduct

const singleProductEnvs = getTestVariables(prefix)

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, { proceedtoCheckout: true })
  })

  it(`In ${prefix} - Updating product quantity to 2`, updateRetry(3), () => {
    // Update Product quantity to 2
    cy.updateProductQuantity(productName, {
      quantity: productQuantity,
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

  completeThePayment(singleProduct, singleProductEnvs)

  preserveCookie()
})
