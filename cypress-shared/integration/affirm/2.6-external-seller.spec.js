/* eslint-disable jest/expect-expect */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import { externalSeller } from '../../support/common/outputvalidation'
import { getTestVariables } from '../../support/common/testcase.js'
import { completeThePayment } from '../../support/affirm/testcase.js'

const { prefix, product1Name, product2Name, pickUpPostalCode } = externalSeller
const externalSellerEnvs = getTestVariables(prefix)

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(product1Name)
    // Add product to cart
    cy.addProduct(product1Name, {
      productDetailPage: true,
      proceedtoCheckout: false,
    })
    // Search the product
    cy.searchProduct(product2Name)
    // Add product to cart
    cy.addProduct(product2Name, {
      proceedtoCheckout: true,
      productDetailPage: true,
    })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({
      postalCode: pickUpPostalCode,
      phoneNumber: '(312) 310 3249',
    })
  })

  completeThePayment(externalSeller, externalSellerEnvs, true)
})
