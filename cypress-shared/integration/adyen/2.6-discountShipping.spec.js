/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { discountShipping } from '../../support/common/outputvalidation.js'
import { completePyamentWithDinersCard } from '../../support/adyen/testcase.js'
import { getTestVariables } from '../../support/common/testcase.js'

describe('Discount Shipping Testcase', () => {
  loginViaCookies()

  const { prefix, productName, postalCode, productQuantity } = discountShipping

  const { orderIdEnv } = getTestVariables(prefix)

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, { proceedtoCheckout: true })
  })

  it(
    `In ${prefix} - Updating product quantity to ${productQuantity}`,
    updateRetry(3),
    () => {
      // Update Product quantity to 1
      cy.updateProductQuantity(productName, {
        quantity: productQuantity,
        verifySubTotal: false,
      })
    }
  )

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({ postalCode })
  })

  completePyamentWithDinersCard(prefix, orderIdEnv)

  preserveCookie()
})
