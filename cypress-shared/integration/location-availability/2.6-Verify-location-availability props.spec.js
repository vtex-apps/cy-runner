import { UsDetails1 } from '../../support/shopper-location/outputvalidation'
import {
  updateRetry,
  preserveCookie,
  loginAsAdmin,
  loginAsUser,
} from '../../support/common/support'
import locationAvailabilityProducts from '../../support/location-availability/product'
import selectors from '../../support/common/selectors'

const { country1, postalCode1 } = UsDetails1

describe('Verify-Location-availability', () => {
  // Load test setup
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it('Adding Location & Verify location Availability', updateRetry(3), () => {
    cy.addNewLocation(country1, postalCode1)
    cy.get('div[class*=vtex-modal-layout]').should('not.be.visible')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000)
    cy.scrollTo(0, 500)
    cy.get(selectors.AddressCity).contains('Pomona')
    cy.get(selectors.AddressZip).contains('91766')
    cy.get(selectors.Distance).contains('Distance:')
  })

  it('Search results & product specification', updateRetry(3), () => {
    cy.searchProduct(locationAvailabilityProducts.orange.name)
    cy.get(locationAvailabilityProducts.orange.link)
      .should('be.visible')
      .click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000)
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.get('body').then(($body) => {
      expect(
        $body.find(selectors.VerifyMaxItem).length
        // eslint-disable-next-line jest/valid-expect
      ).to.equal(3)
    })
    cy.get(selectors.OrderByFaster).should('be.visible')
  })

  preserveCookie()
})
