/* eslint-disable cypress/no-force */
/* eslint-disable jest/expect-expect */
import {
  fillContactInfo,
  loginViaCookies,
  updateRetry,
} from '../../support/common/support.js'
import { multiProduct } from '../../support/common/outputvalidation'
import selectors from '../../support/common/selectors.js'

describe('Multi Product Testcase', () => {
  loginViaCookies()

  const { prefix, product1Name, product2Name, postalCode } = multiProduct

  it('Adding Product to Cart', updateRetry(3), () => {
    // Search the product
    cy.searchProduct(product1Name)
    // Add product to cart
    cy.addProduct(product1Name, { proceedtoCheckout: false })
    // Search the product
    cy.searchProduct(product2Name)
    // Add product to cart
    cy.addProduct(product2Name, {
      proceedtoCheckout: true,
    })
  })

  it('Updating product quantity to 2', updateRetry(3), () => {
    cy.checkForTaxErrors()
    // Update Product quantity to 2
    cy.updateProductQuantity(multiProduct, { quantity: '2' })
  })

  it('Updating Shipping Information', updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({ postalCode })
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
})
