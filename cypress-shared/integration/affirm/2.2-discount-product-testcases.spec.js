/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { discountProduct } from '../../support/affirm/outputvalidation'
import { deleteAddresses } from '../../support/common/testcase.js'
import {
  completePayment,
  InitiatePayment,
} from '../../support/affirm/affirm.js'

const { prefix, productName, postalCode } = discountProduct

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  deleteAddresses()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    cy.clearLocalStorage()
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, { proceedtoCheckout: true })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({ postalCode, phoneNumber: '(312) 310 3249' })
  })

  it('Store order id and payment redirect url', updateRetry(3), () => {
    // cy.intercept('**/shippingData').as('shippingData')
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

  preserveCookie()
})
