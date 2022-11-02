import selectors from '../common/selectors'

export function verifyHomePage(city, postalCode, distance = false) {
  cy.scrollTo(0, 500)
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === 'updateOrderFormShipping') {
        req.continue()
      }
    }).as('updateOrderFormShipping')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000)
    cy.get(selectors.addressContainer).should('be.visible')
    if (distance) {
      cy.get(selectors.Distance).should('not.exist')
      cy.get(selectors.shippingInfo).contains('Get it in')
    } else {
      cy.get(selectors.AddressCity).contains(city)
      cy.get(selectors.AddressZip).contains(postalCode)
      cy.get(selectors.Distance).contains('Distance:')
      cy.wait('@updateOrderFormShipping', { timeout: 20000 })
    }
  })
}
