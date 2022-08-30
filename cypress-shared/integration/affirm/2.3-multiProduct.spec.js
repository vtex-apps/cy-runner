/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { multiProduct } from '../../support/affirm/outputvalidation.js'
import { getTestVariables } from '../../support/common/testcase.js'
import { completeThePayment } from '../../support/affirm/testcase.js'

const { prefix, product1Name, product2Name, postalCode, productQuantity } =
  multiProduct

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  const multiProductEnvs = getTestVariables(prefix)

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(1), () => {
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

  it(`In ${prefix} - Updating product quantity to 2`, updateRetry(4), () => {
    // Update Product quantity to 2
    cy.updateProductQuantity(product1Name, {
      quantity: productQuantity,
      verifySubTotal: false,
    })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(4), () => {
    // Update Shipping Section
    cy.updateShippingInformation({
      postalCode,
      phoneNumber: '(312) 310 3249',
      timeout: 10000,
    })
  })

  completeThePayment(multiProduct, multiProductEnvs)

  preserveCookie()
})
