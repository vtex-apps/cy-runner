import selectors from '../common/selectors'
import affirmSelectors from './affirmSelectors'
import { ENTITIES } from '../common/constants'

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
    cy.get(affirmSelectors.AffirmPayment).should('be.visible').click()
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

    // cy.location('pathname').should('include', '/checkoutnow')
    cy.url().then((url) => {
      // Setting PaypalCheckoutNow URL in .orders.json
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
