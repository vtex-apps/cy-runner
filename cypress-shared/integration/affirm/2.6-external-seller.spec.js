/* eslint-disable jest/expect-expect */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import { externalSeller } from '../../support/common/outputvalidation'
import {
  deleteAddresses,
  getTestVariables,
} from '../../support/common/testcase.js'
import { completeThePayment } from '../../support/affirm/testcase.js'

const { prefix, product1Name, product2Name, pickUpPostalCode } = externalSeller
const externalSellerEnvs = getTestVariables(prefix)

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  deleteAddresses()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(product1Name)
    // Add product to cart
    cy.addProduct(product1Name, { proceedtoCheckout: false, paypal: true })
    // Search the product
    cy.searchProduct(product2Name)
    // Add product to cart
    cy.addProduct(product2Name, {
      proceedtoCheckout: true,
      paypal: true,
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

  it('Complete payment', updateRetry(3), () => {
    completeThePayment(externalSeller, {
      ...externalSellerEnvs,
      sendInvoice: false,
    })
  })
})
