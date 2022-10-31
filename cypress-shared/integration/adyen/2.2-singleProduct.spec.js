/* eslint-disable cypress/no-force */
/* eslint-disable jest/expect-expect */
import { singleProduct } from '../../support/common/outputvalidation'
import selectors from '../../support/common/selectors'
import {
  fillContactInfo,
  loginViaCookies,
  preserveCookie,
  // saveOrderId,
  updateRetry,
} from '../../support/common/support'

const { prefix, postalCode, productName, productQuantity } = singleProduct

describe(`${prefix} scenarios`, () => {
  loginViaCookies()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName)
  })

  it(
    `In ${prefix} - Updating product quantity to ${productQuantity}`,
    updateRetry(4),
    () => {
      cy.updateProductQuantity(productName, {
        quantity: productQuantity,
        verifySubTotal: false,
      })
    }
  )

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(4), () => {
    // Update Shipping Section
    cy.updateShippingInformation({
      postalCode,
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it(`In ${prefix} -Ordering the product`, updateRetry(2), () => {
    cy.get(selectors.FirstName).then(($el) => {
      if (Cypress.dom.isVisible($el)) {
        fillContactInfo()
      }
    })
    cy.get('#payment-group-creditCardPaymentGroup').click()

    cy.getIframeBody('.payment-method iframe')
      .find('input[name="cardNumber"]', { timeout: 45000 })
      .should('be.visible')
      .type('3600 6666 3333 44', { force: true })

    cy.getIframeBody('.payment-method iframe')
      .find('input[name="ccName"]', { timeout: 45000 })
      .should('be.visible')
      .type('Testing', { force: true })

    cy.getIframeBody('.payment-method iframe')
      .find('select[name="cardExpirationMonth"]', { timeout: 45000 })
      .should('be.visible')
      .select('03', { force: true })

    cy.getIframeBody('.payment-method iframe')
      .find('select[name="cardExpirationYear"]', { timeout: 45000 })
      .should('be.visible')
      .select('30', { force: true })

    cy.getIframeBody('.payment-method iframe')
      .find('.PaymentCardCVV input', { timeout: 45000 })
      .should('be.visible')
      .type('737', { force: true })
    cy.get(selectors.BuyNowBtn).last().click()
    // saveOrderId(orderIdEnv)
  })

  //   invoiceAPITestCase({
  //     product: singleProduct,
  //     env: orderIdEnv,
  //     transactionIdEnv,
  //   })

  //   sendInvoiceTestCase({ product: singleProduct, orderIdEnv })

  preserveCookie()
})
