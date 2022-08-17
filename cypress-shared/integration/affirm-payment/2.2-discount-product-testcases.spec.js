/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { singleProduct } from '../../support/affirm-payment/outputvalidation'
import selectors from '../../support/common/selectors.js'
import { HEADERS } from '../../support/common/constants.js'

const { prefix, productName, postalCode } = singleProduct

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, { proceedtoCheckout: true })
  })

  // it(`In ${prefix} -  Updating product quantity to 2`, updateRetry(3), () => {
  //   // Update Product quantity to 2
  //   cy.updateProductQuantity(singleProduct, { quantity: '2' })
  // })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({ postalCode })
  })

  it('complete payment', updateRetry(3), () => {
    cy.get('a[href="#/profile"]').click()
    cy.get('#client-phone').clear().type('(312) 310 3249', {
      delay: 100,
    })
    cy.get('#go-to-payment').first().click()
    cy.get('a[data-name="Affirm"]').should('be.visible').click()
    cy.get(selectors.BuyNowBtn).last().click()
    // cy.wait(40000)
    // cy.getVtexItems().then((vtex) => {
    //   cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
    //     if (req.body.operationName === 'OrderData') {
    //       req.continue()
    //     }
    //   }).as('OrderData')
    cy.url().then((url) => {
      cy.setOrderItem('affirmpaymentUrl', url)
    })
    //   cy.wait(`@OrderData`, { timeout: 30000 })
    // })
  })

  it('Open affirm payment screen', updateRetry(3), () => {
    cy.getOrderItems().then((order) => {
      cy.visit(order.affirmpaymentUrl, { ...HEADERS })
    })
  })

  preserveCookie()
})
