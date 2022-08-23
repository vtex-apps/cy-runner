/* eslint-disable jest/expect-expect */

import {
  preserveCookie,
  updateRetry,
  loginViaCookies,
} from '../../support/common/support'
import {
  deleteAddresses,
  paymentWithAffirm,
  getTestVariables,
} from '../../support/affirm/affirm'
import selectors from '../../support/common/selectors'
import { singleProduct } from '../../support/common/outputvalidation'
import { HEADERS } from '../../support/common/constants.js'

const prefix = 'singleProduct'
const singleProductEnvs = getTestVariables(prefix)
const { productName, postalCode } = singleProduct

describe('Order the product using Affirm payment', () => {
  loginViaCookies({ storeFrontCookie: true })

  deleteAddresses()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName)
  })
  it('Add the product with invalid phone number', updateRetry(3), () => {
    cy.updateShippingInformation({ postalCode: postalCode })
  })

  paymentWithAffirm({ prefix, ...singleProductEnvs })

  it('Validate with invalid phone number', updateRetry(3), () => {
    cy.intercept('POST', `https://sandbox.affirm.com/api/v2/checkout/`).as(
      'updateOrderFormShipping'
    )
    cy.wait('@updateOrderFormShipping')
      .its('response')
      .then((response) => {
        expect(response.body.message).includes('Please enter a valid mobile')
      })
  })

  it('close the pop up', updateRetry(3), () => {
    cy.getIframeBody(selectors.popUpClose).should('be.visible')
    cy.getIframeBody(selectors.popUpClose)
      .find(selectors.invalidPopUpCloseBtn)
      .should('be.visible')
      .click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000)
    cy.get(selectors.dataReviewCloseBtn).click()
  })

  it(
    'Validate with valid phone number and payment redirect url',
    updateRetry(3),
    () => {
      cy.intercept('**/shippingData').as('shippingData')
      cy.get('a[href="#/profile"]').click({ force: true })
      cy.get(selectors.Phone)
        .invoke('val')
        .then((phone) => {
          if (phone !== '(312) 310 3249') {
            cy.get(selectors.Phone).clear().type('(312) 310 3249', {
              delay: 100,
            })
          }
        })
      // cy.get(selectors.ProceedtoShipping).click()
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
    }
  )

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

  preserveCookie()
})
