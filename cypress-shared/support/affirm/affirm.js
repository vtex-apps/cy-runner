import selectors from '../common/selectors'
import { ENTITIES } from '../common/constants'
import { saveOrderId, clickBtnOnVisibility } from '../common/support'

export function paymentWithAffirm({
  prefix,
  affirmCheckoutNowUrl,
  productTotalEnv,
  productInDollarEnv,
}) {
  it(`In ${prefix} - Proceed payment with Affirm`, { retries: 1 }, () => {
    cy.get(selectors.ChangeShippingAddress).then(($el) => {
      if (Cypress.dom.isVisible($el)) {
        cy.get(selectors.ChangeShippingAddress).click()
      }
    })
    cy.get('body').then(($body) => {
      if ($body.find(selectors.GotoPaymentBtn).length) {
        cy.get(selectors.GotoPaymentBtn).click({ timeout: 10000 })
      }
    })

    cy.intercept('**/paymentData').as('payment')
    cy.get(selectors.AffirmPaymentOption).should('be.visible').click()
    cy.wait('@payment')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)
    cy.get(selectors.TotalLabel)
      .invoke('text')
      .then((amountText) => {
        const [amountInDollar] = amountText
          .replace(/ /g, '')
          .replace('$', '')
          .split('$')

        // Setting Product Total in .orders.json
        cy.setOrderItem(productInDollarEnv, amountInDollar)
        cy.setOrderItem(
          productTotalEnv,
          parseInt(amountInDollar.replace(/,/g, '').replace('.', ''), 10)
        )
      })
    cy.get(selectors.BuyNowBtn).last().click()
    cy.url().then((url) => {
      cy.setOrderItem(affirmCheckoutNowUrl, url)
    })
  })
}

export function getTestVariables(prefix) {
  return {
    affirmCheckoutNowUrl: `${prefix}-affirmCheckoutNowUrl`,
    sandboxOrderPage: `${prefix}-sandboxOrderPage`,
    transactionIdEnv: `${prefix}-transactionIdEnv`,
    productTotalEnv: `${prefix}-productTotalEnv`,
    productInDollarEnv: `${prefix}-productInDollarEnv`,
  }
}

export function deleteAddresses() {
  it('Getting user & then deleting addresses associated with that user', () => {
    cy.getVtexItems().then((vtex) => {
      cy.searchInMasterData(ENTITIES.CLIENTS, vtex.robotMail).then(
        (clients) => {
          cy.searchInMasterData(ENTITIES.ADDRESSES, clients[0].id).then(
            (addresses) => {
              for (const { id } of addresses) {
                cy.deleteDocumentInMasterData(ENTITIES.ADDRESSES, id)
              }
            }
          )
        }
      )
    })
  })
}

export function completePayment(prefix) {
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
  cy.getIframeBody('#checkout-application').find(selectors.AffirmSubmit).click()
  cy.getIframeBody('#checkout-application')
    .contains('Thanks')
    .should('be.visible')
  saveOrderId(prefix)
}

export function InitiatePayment() {
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
  cy.get(selectors.InstallmentContainer).should('be.visible').contains('Total')
  cy.get(selectors.BuyNowBtn).last().should('be.visible').click()
}
