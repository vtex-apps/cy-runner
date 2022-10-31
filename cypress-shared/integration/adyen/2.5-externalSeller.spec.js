/* eslint-disable cypress/no-force */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-disabled-tests */
import {
  fillContactInfo,
  loginViaCookies,
  updateRetry,
} from '../../support/common/support.js'
import { externalSeller } from '../../support/outputvalidation.js'
import selectors from '../../support/common/selectors.js'

describe('External Seller Testcase', () => {
  loginViaCookies()

  const {
    prefix,
    product1Name,
    product2Name,
    postalCode,
    directSaleTax,
    externalSellerTax,
  } = externalSeller

  it.skip('Verifying tax amount for external seller product via order-tax API', () => {
    // We have stored externalSeller.json in cypress/fixtures
    // That we are loading using cy.fixture() command and passing as a payload to orderTaxAPI
    cy.fixture('externalSeller').then((requestPayload) =>
      cy.orderTaxApi(requestPayload, externalSellerTax)
    )
  })

  it('Verifying tax amount for direct sale product via order-tax API', () => {
    // We have stored singleProduct.json in cypress/fixtures
    // That we are loading using cy.fixture() command and passing to orderTaxAPI
    cy.fixture('directSale').then((requestPayload) =>
      cy.orderTaxApi(requestPayload, directSaleTax)
    )
  })

  it('Adding Product to Cart', updateRetry(3), () => {
    // Search the product
    cy.searchProduct(product1Name)
    // Add product to cart
    cy.addProduct(product1Name, { proceedtoCheckout: false })
    // Search the product
    cy.searchProduct(product2Name)
    // Add product to cart
    cy.addProduct(product2Name, { proceedtoCheckout: true })
  })

  it('Updating product quantity to 1', updateRetry(3), () => {
    cy.checkForTaxErrors()
    // Update Product quantity to 1
    cy.updateProductQuantity(externalSeller, { quantity: '1' })
  })

  it('Updating Shipping Information', updateRetry(3), () => {
    cy.checkForTaxErrors()
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
