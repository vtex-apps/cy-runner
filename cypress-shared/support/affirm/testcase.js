import { sendInvoiceTestCase, invoiceAPITestCase } from '../common/testcase.js'
import selectors from '../common/selectors.js'
import {
  updateRetry,
  saveOrderId,
  clickBtnOnVisibility,
} from '../common/support.js'

export function completeThePayment(product, { orderIdEnv, transactionIdEnv }) {
  const { prefix } = product

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

  sendInvoiceTestCase(product, orderIdEnv)

  // Get transactionId from invoiceAPI and store in .orders.json
  invoiceAPITestCase({
    product,
    env: orderIdEnv,
    transactionIdEnv,
  })
}
