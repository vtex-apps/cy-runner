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
  completePayment,
  InitiatePayment,
} from '../../support/affirm/affirm'
import selectors from '../../support/common/selectors'
import { singleProduct } from '../../support/common/outputvalidation'

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
    cy.updateShippingInformation({ postalCode })
  })

  paymentWithAffirm({ prefix, ...singleProductEnvs })

  it('Validate with invalid phone number', updateRetry(3), () => {
    cy.intercept('POST', `https://sandbox.affirm.com/api/v2/checkout/`).as(
      'updateOrderFormShipping'
    )
    cy.wait('@updateOrderFormShipping')
      // .its('response')
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
    }
  )

  it('Complete payment', updateRetry(3), () => {
    completePayment()
  })

  preserveCookie()
})
