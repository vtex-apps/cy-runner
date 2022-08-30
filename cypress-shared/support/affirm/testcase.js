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
  externalSeller = false,
  retries = 0,
}) {
  it(
    `In ${prefix} - Initiate payment ${
      completePayment ? ' and complete the payment' : ''
    }`,
    updateRetry(retries),
    () => {
      clickBtnOnVisibility(selectors.Profile)
      cy.get(selectors.Phone)
        .invoke('val')
        .then((phone) => {
          if (phone !== expectedPhoneNo) {
            cy.get(selectors.Phone)
              .should('be.visible')
              .clear()
              .type(expectedPhoneNo, {
                delay: 100,
              })
          }
        })

      clickBtnOnVisibility(selectors.GoToPayment)
      clickBtnOnVisibility(selectors.ProceedtoShipping)

      cy.get(selectors.AffirmPaymentOption, { timeout: 10000 })
        .should('be.visible')
        .click()
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

        cy.getVtexItems().then((vtex) => {
          cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
            if (req.body.operationName === 'OrderUpdate') {
              req.continue()
            }
          }).as('OrderUpdate')
          cy.getIframeBody('#checkout-application')
            .contains('Thanks')
            .should('be.visible')
          cy.wait('@OrderUpdate', { timeout: 35000 })
        })

        saveOrderId(orderIdEnv, externalSeller)
      } else {
        cy.log('Complete Payment is disabled')
      }
    }
  )
}

export function completeThePayment(
  product,
  { orderIdEnv, transactionIdEnv, sendInvoice = true, completePayment = true },
  externalSellerTestcase = false
) {
  const { prefix } = product

  initiatePayment({
    prefix,
    completePayment,
    orderIdEnv,
    externalSeller: externalSellerTestcase ? product : false,
  })

  if (sendInvoice) {
    sendInvoiceTestCase({ product, orderIdEnv })

    // Get transactionId from invoiceAPI and store in .orders.json
    invoiceAPITestCase({
      product,
      env: orderIdEnv,
      transactionIdEnv,
    })
  }
}
