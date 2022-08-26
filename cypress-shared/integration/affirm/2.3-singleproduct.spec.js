/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { singleProduct } from '../../support/affirm/outputvalidation'
import {
  completePayment,
  InitiatePayment,
} from '../../support/affirm/affirm.js'

const { prefix, productName, postalCode } = singleProduct
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
  preserveCookie()
})
// A https://sandbox.affirm.com/checkout/84971L7SGAB1MVTX/new/GGJZFRF9QXF6I48L/?skip_to_pin=0&use_headers=0&locale=en_US&external_modal=0&country_code=USA&fs=1&
// A https://sandbox.affirm.com/checkout/84971L7SGAB1MVTX/new/O3LYKMNL23FNYFSO/?skip_to_pin=0&use_headers=0&locale=en_US&external_modal=0&country_code=USA&fs=1&device_id=f4530555-8a0b-4304-bb8c-3a459ef178ed&origin=https%3A%2F%2Fsyedaffirm--productusqa.myvtex.com&frameId=checkout-application
// BCypress https://sandbox.affirm.com/checkout/84971L7SGAB1MVTX/new/GGJZFRF9QXF6I48L/?skip_to_pin=0&use_headers=0&locale=en_US&external_modal=0&country_code=USA
