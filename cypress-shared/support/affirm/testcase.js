import { sendInvoiceTestCase, invoiceAPITestCase } from '../common/testcase.js'
import selectors from '../common/selectors.js'
import {
  updateRetry,
  saveOrderId,
  clickBtnOnVisibility,
} from '../common/support.js'

export function initiatePayment({
  prefix,
  orderIdEnv,
  expectedPhoneNo = '(312) 310 3249',
  completePayment = false,
}) {
  it(
    `In ${prefix} - Initiate payment ${
      completePayment ? ' and complete the payment' : ''
    }`,
    updateRetry(3),
    () => {
      cy.get(selectors.Profile).should('be.visible').click()
      cy.get(selectors.Phone)
        .invoke('val')
        .then((phone) => {
          if (phone !== expectedPhoneNo) {
            cy.get(selectors.Phone).clear().type(expectedPhoneNo, {
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

      // Complete Payment
      if (completePayment) {
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
      } else {
        cy.log('Complete Payment is disabled')
      }
    }
  )
}

export function completeThePayment(
  product,
  { orderIdEnv, transactionIdEnv, sendInvoice = true, completePayment = true }
) {
  const { prefix } = product

  initiatePayment({ prefix, completePayment, orderIdEnv })

  if (sendInvoice) {
    sendInvoiceTestCase({ prefix, product, orderIdEnv })

    // Get transactionId from invoiceAPI and store in .orders.json
    invoiceAPITestCase({
      product,
      env: orderIdEnv,
      transactionIdEnv,
      prefix,
    })
  }
}
