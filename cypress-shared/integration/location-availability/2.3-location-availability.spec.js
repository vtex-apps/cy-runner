import {
  preserveCookie,
  loginAsAdmin,
  loginAsUser,
  updateRetry,
} from '../../support/common/support'
import { franceDetails } from '../../support/shopper-location/outputvalidation'
import locationAvailabilityProducts from '../../support/location-availability/product'
import selectors from '../../support/common/selectors'
import { addAddress } from '../../support/shopper-location/common'

describe('Location deliverable', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  addAddress({ address: franceDetails })

  // eslint-disable-next-line jest/expect-expect
  it('Verify shipping content', updateRetry(2), () => {
    cy.get(locationAvailabilityProducts.orange.link).should('be.visible')
    cy.getVtexItems().then((vtex) => {
      cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
        if (req.body.operationName === 'updateOrderFormShipping') {
          req.continue()
        }
      }).as('updateOrderFormShipping')
      cy.get(selectors.shippingContent)
        .should('be.visible')
        .contains('FREE Shipping:')
      cy.wait('@updateOrderFormShipping', { timeout: 20000 })
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it('Open product specfication page and verify', updateRetry(2), () => {
    cy.openProduct(locationAvailabilityProducts.orange.name, true)
    cy.get(selectors.storeUnavailabilityInformation)
      .should('be.visible')
      .contains(
        'The selected item is not available for pickup near your location.'
      )
  })

  preserveCookie()
})
