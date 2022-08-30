/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { discountProduct } from '../../support/affirm/outputvalidation'
import {
  deleteAddresses,
  getTestVariables,
} from '../../support/common/testcase.js'
import { completeThePayment } from '../../support/affirm/testcase.js'

const { prefix, productName, postalCode } = discountProduct

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  const discountProductEnvs = getTestVariables(prefix)

  deleteAddresses()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(1), () => {
    cy.clearLocalStorage()
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, { proceedtoCheckout: true })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(4), () => {
    // Update Shipping Section
    cy.updateShippingInformation({ postalCode, phoneNumber: '(312) 310 3249' })
  })

  completeThePayment(discountProduct, discountProductEnvs)

  preserveCookie()
})
