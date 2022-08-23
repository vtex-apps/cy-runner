/* eslint-disable jest/expect-expect */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import { multiProduct } from '../../support/common/outputvalidation'
import selectors from '../../support/common/selectors.js'
import { HEADERS } from '../../support/common/constants.js'
import { deleteAddresses } from '../../support/common/testcase.js'

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
    cy.intercept('**/shippingData').as('shippingData')
    cy.get(selectors.Profile).click()
    cy.wait('@shippingData')
    cy.get(selectors.Phone)
      .invoke('val')
      .then((phone) => {
        if (phone !== '(312) 310 3249') {
          cy.get(selectors.Phone).clear().type('(312) 310 3249', {
            delay: 100,
          })
        }
      })
    cy.get(selectors.GoToPayment).first().click()
    cy.get(selectors.AffirmPaymentOption).should('be.visible').click()
    cy.get(selectors.BuyNowBtn).last().click()
    cy.intercept('GET', `**operationName=OrderData**`).as('OrderData')
    cy.intercept('POST', `https://sandbox.affirm.com/api/v2/checkout/`).as(
      'affirmPayment'
    )
    cy.wait('@OrderData')
      .its('response.body')
      .then((response) => {
        cy.setOrderItem(
          'discountProductOrderId',
          response.data.orderData.orderId
        )
      })
    cy.wait('@affirmPayment')
      .its('response')
      .then((response) => {
        cy.setOrderItem('affirmpaymentUrl', response.body.redirect_url)
      })
  })

  it('Complete payment', updateRetry(3), () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)
    cy.getOrderItems().then((order) => {
      cy.visit(order.affirmpaymentUrl, { ...HEADERS })
    })
    cy.get(selectors.AffirmPhoneNumberField).clear().type('3123103249')
    cy.get(selectors.AffirmSubmit).click()
    cy.get(selectors.AffirmPhonePin).type('1234')
    cy.get('h1').should('have.text', "You're approved!")
    cy.get(selectors.AffirmInstallmentOption).first().click()
    cy.get(selectors.AffirmIndicatorOption).first().click()
    cy.get(selectors.AffirmIndicatorOption).last().click()
    cy.get(selectors.AffirmSubmit).click()
    cy.contains('Thanks').should('be.visible')
  })

  it('Verify order placed successfully', updateRetry(2), () => {
    cy.getVtexItems().then((vtex) => {
      cy.getOrderItems().then((order) => {
        cy.visit(
          `${vtex.baseUrl}/checkout/orderPlaced/?og=${order.discountProductOrderId}`
        )
      })
    })
  })
})
