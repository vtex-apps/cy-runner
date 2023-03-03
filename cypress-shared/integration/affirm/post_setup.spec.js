import {
  loginViaCookies,
  preserveCookie,
  scroll,
  updateRetry,
} from '../../support/common/support.js'
import {
  setWorkspaceAndGatewayAffiliations,
  startPaymentE2ETests,
  syncCheckoutUICustom,
} from '../../support/common/testcase.js'
import selectors from '../../support/common/selectors'

function verifyAffirmPromotion() {
  cy.get(selectors.AffirmPromoComponents, { timeout: 20000 }).should(
    'be.visible'
  )
  cy.get(selectors.AffirmModal).should('be.visible').first().click()
  cy.get(selectors.AffirmIFrame).should('be.visible')
  cy.getIframeBody(selectors.AffirmIFrame)
    .find(selectors.AffirmClosePopup)
    .should('be.visible')
    .click()
}

describe('Setting up affirm in dynamic environment', () => {
  loginViaCookies()

  it('Here', () => {
    cy.addGraphqlLogs('syed', 'testing')
  })

  // startPaymentE2ETests()
  // setWorkspaceAndGatewayAffiliations()
  // syncCheckoutUICustom()

  // it('Set public token in affirm settigs', () => {
  //   cy.getVtexItems().then((vtex) => {
  //     cy.visit('/admin/apps/vtex.affirm-payment/setup/')
  //     cy.getIframeBody(selectors.AdminConfigurationIFrame)
  //       .find(selectors.AffirmAdminPublicKey)
  //       .should('be.visible')
  //       .clear()
  //       .type(vtex.publicKeyForPromotionalComponents)
  //     cy.getIframeBody(selectors.AdminConfigurationIFrame)
  //       .find(selectors.AffirmSubmitConfiguration)
  //       .should('be.visible')
  //       .click()
  //   })
  // })

  // it('Verify promotions get displayed in storefront', updateRetry(1), () => {
  //   cy.visit('/')
  //   cy.waitForSession()
  //   cy.get(selectors.ProfileLabel, { timeout: 20000 })
  //     .should('be.visible')
  //     .should('have.contain', `Hello,`)
  //   scroll()
  //   verifyAffirmPromotion()
  //   cy.url().should('include', '/p')
  //   cy.get('div[class*=shippingContainer]').should('be.visible')
  //   verifyAffirmPromotion()
  // })

  preserveCookie()
})
