/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
  saveOrderId,
  clickBtnOnVisibility,
} from '../../support/common/support.js'
import { singleProduct } from '../../support/affirm-payment/outputvalidation'
import selectors from '../../support/common/selectors.js'
import {
  sendInvoiceTestCase,
  invoiceAPITestCase,
  getTestVariables,
} from '../../support/common/testcase.js'

const { prefix, productName, postalCode } = singleProduct

const { orderIdEnv, transactionIdEnv } = getTestVariables(prefix)

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
    cy.get(selectors.Profile).should('be.visible').click()
    cy.get(selectors.Phone)
      .invoke('val')
      .then((phone) => {
        if (phone !== '(312) 310 3249') {
          cy.get(selectors.Phone).clear().type('(312) 310 3249', {
            delay: 100,
          })
        }
      })

    clickBtnOnVisibility(selectors.GoToPayment)
    clickBtnOnVisibility(selectors.ProceedtoShipping)

    cy.get(selectors.AffirmPaymentOption).should('be.visible').click()
    cy.get(selectors.InstallmentContainer)
      .should('be.visible')
      .contains('Total')
    cy.get(selectors.BuyNowBtn).last().should('be.visible').click()
  })

  it(`In ${prefix} - Complete payment`, () => {
    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmPhoneNumberField, { timeout: 45000 })
      .should('be.visible')
      .type('3123103249')

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmSubmit)
      .should('be.visible')
      .click()

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmPhonePin)
      .type('1234')

    cy.getIframeBody('#checkout-application')
      .find('h1')
      .should('have.text', "You're approved!")

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmInstallmentOption)
      .first()
      .click()

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmIndicatorOption)
      .first()
      .click()

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmIndicatorOption)
      .last()
      .click()

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmSubmit)
      .click()

    cy.getIframeBody('#checkout-application')
      .contains('Thanks')
      .should('be.visible')

    saveOrderId(orderIdEnv)
  })

  sendInvoiceTestCase(singleProduct, orderIdEnv)

  // Get transactionId from invoiceAPI and store in .orders.json
  invoiceAPITestCase({
    product: singleProduct,
    env: orderIdEnv,
    transactionIdEnv,
  })

  preserveCookie()
})
