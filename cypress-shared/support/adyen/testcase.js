import selectors from '../common/selectors'
import { fillContactInfo, saveOrderId, updateRetry } from '../common/support'

export function completePyamentWithDinersCard(prefix, orderIdEnv) {
  it(`In ${prefix} - Ordering the product`, updateRetry(2), () => {
    cy.get(selectors.FirstName).then(($el) => {
      if (Cypress.dom.isVisible($el)) {
        fillContactInfo()
      }
    })
    cy.get(selectors.CreditCardLink).click()

    cy.getIframeBody(selectors.PaymentMethodIFrame).then(($body) => {
      if (!$body.find(selectors.CardExist).length) {
        // Credit cart not exist
        cy.getIframeBody(selectors.PaymentMethodIFrame)
          .find(selectors.CreditCardNumber)
          .type('3600 6666 3333 44')
        cy.getIframeBody(selectors.PaymentMethodIFrame)
          .find(selectors.CreditCardHolderName)
          .type('Testing')
        cy.getIframeBody(selectors.PaymentMethodIFrame)
          .find(selectors.CreditCardExpirationMonth)
          .select('03')
        cy.getIframeBody(selectors.PaymentMethodIFrame)
          .find(selectors.CreditCardExpirationYear)
          .select('30')
      }

      cy.getIframeBody(selectors.PaymentMethodIFrame).then(($paymentBtn) => {
        if ($paymentBtn.find(selectors.PaymentMethodIFrame).length) {
          cy.getIframeBody(selectors.PaymentMethodIFrame)
            .find('.SavedCard span[class*=Diners]')
            .click()
        }
      })

      cy.getIframeBody(selectors.PaymentMethodIFrame)
        .find(selectors.CreditCardCode)
        .type('737')
      cy.get(selectors.BuyNowBtn).last().click()
      saveOrderId(orderIdEnv)
    })
  })
}
