import selectors from '../common/selectors.js'
import { updateRetry } from '../common/support.js'
import { BUTTON_LABEL } from '../validation_text.js'
import { PAYMENT_TERMS } from './utils.js'

export function checkoutProduct(product) {
  it('Checkout the Product', updateRetry(2), () => {
    cy.searchProductinB2B(product)
    cy.get(selectors.searchResult)
      .first()
      .should('have.text', product.toLowerCase())
    cy.get('span[class*=add-to-cart]').should('be.visible').first().click()
    cy.intercept('**/checkout/**').as('checkout')
    cy.get(selectors.ProceedtoCheckout).click()
    cy.wait('@checkout')
    cy.get('body').then(($body) => {
      if ($body.find(selectors.ShippingCalculateLink).length) {
        // Contact information needs to be filled
        cy.get(selectors.ShippingCalculateLink).should('be.visible')
      } else if ($body.find(selectors.DeliveryAddress).length) {
        // Contact Information already filled
        cy.get(selectors.DeliveryAddress).should('be.visible')
      }
    })
    cy.get(selectors.ProceedtoPaymentBtn).should('be.visible').click()
  })
}

export function fillContactInfo() {
  it('Fill Contact Information', updateRetry(3), () => {
    cy.get(selectors.FirstName).then(($el) => {
      if (Cypress.dom.isVisible($el)) {
        cy.get(selectors.FirstName).clear().type('Syed', { delay: 50 })
        cy.get(selectors.LastName).clear().type('Mujeeb', { delay: 50 })
        cy.get(selectors.Phone).clear().type('(304) 123 4556', { delay: 50 })
        cy.get(selectors.ProceedtoShipping).should('be.visible').click()
        cy.get('body').then(($body) => {
          if ($body.find(selectors.ReceiverName).length) {
            cy.get(selectors.ReceiverName, { timeout: 5000 })
              .clear()
              .type('Syed')
          }
        })
        cy.get(selectors.GotoPaymentBtn, { timeout: 5000 }).should('be.visible')
      } else {
        cy.log('Contact information already filled')
      }
    })
  })
}

export function verifyAddress(address) {
  it('Verify Auto fill Address in checkout', updateRetry(3), () => {
    cy.setorderFormDebugItem()
    if (cy.state('runnable')._currentRetry > 1) cy.reload()
    cy.get('body').then(($shipping) => {
      if ($shipping.find(selectors.OpenShipping).length) {
        cy.get(selectors.OpenShipping, { timeout: 5000 }).click()
      }

      if ($shipping.find(selectors.EditShipping).length) {
        cy.get(selectors.EditShipping).should('be.visible').click()
      }
    })

    for (const { postalCode } of address) {
      cy.get(selectors.PostalCodeText, { timeout: 5000 })
        .contains(postalCode)
        .click()
      cy.get(selectors.GotoPaymentBtn, { timeout: 5000 }).should('be.visible')
    }

    cy.get('body').then(($body) => {
      if ($body.find(selectors.GotoPaymentBtn).length) {
        cy.get(selectors.GotoPaymentBtn, { timeout: 5000 })
          .should('be.visible')
          .click()
      }
    })
  })
}

export function verifyPayment(promissory = true) {
  it('Verify enabled payments is shown in the checkout', updateRetry(3), () => {
    if (cy.state('runnable')._currentRetry > 0) cy.reload()
    if (promissory) {
      cy.get(`[data-name='${PAYMENT_TERMS.Promissory}']`).should('be.visible')
    } else {
      cy.get(`[data-name='${PAYMENT_TERMS.Promissory}']`).should(
        'not.be.visible'
      )
    }

    cy.get(`[data-name='${PAYMENT_TERMS.NET30}']`).should('be.visible')
  })
}

export function ordertheProduct(role) {
  it(`Verify ${role} is able to order the product`, () => {
    cy.get(`[data-name='${PAYMENT_TERMS.NET30}']`)
      .should('be.visible')
      .click({ force: true })
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)
    cy.contains(BUTTON_LABEL.completeOrder)
      .should('be.visible')
      .click({ force: true })
    cy.get(selectors.Search, { timeout: 30000 }).should('be.visible')
  })
}
