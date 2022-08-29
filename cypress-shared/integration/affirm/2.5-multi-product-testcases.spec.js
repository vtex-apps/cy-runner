/* eslint-disable jest/expect-expect */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import { multiProduct } from '../../support/common/outputvalidation'
import { deleteAddresses } from '../../support/common/testcase.js'
import {
  completePayment,
  InitiatePayment,
} from '../../support/affirm/affirm.js'

const { prefix, product1Name, product2Name, pickUpPostalCode } = multiProduct

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

  it('Store order id and payment redirect url', updateRetry(3), () => {
    InitiatePayment()
    cy.intercept('GET', `**operationName=OrderData**`).as('OrderData')
    cy.wait('@OrderData')
      .its('response.body')
      .then((response) => {
        cy.setOrderItem(
          'discountProductOrderId',
          response.data.orderData.orderId
        )
      })
  })

  it('Complete payment', updateRetry(3), () => {
    completePayment(prefix)
  })
})
