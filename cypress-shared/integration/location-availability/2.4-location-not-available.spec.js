/* eslint-disable jest/expect-expect */
import {
  preserveCookie,
  loginAsAdmin,
  loginAsUser,
  updateRetry,
} from '../../support/common/support'
import { canadaDetails1 } from '../../support/shopper-location/outputvalidation'
import locationAvailabilityProducts from '../../support/location-availability/product'
import selectors from '../../support/common/selectors'
import { addLocation } from '../../support/shopper-location/common'

const { country, PostalCode } = canadaDetails1

describe('Location deliverable', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it('HomePage', updateRetry(3), () => {
    addLocation({ country, PostalCode })
    cy.scrollTo(0, 500)
    cy.get(locationAvailabilityProducts.orange.link).should('be.visible')
    cy.get(selectors.shippingUnavailable).contains('Unavailable for')
  })

  // eslint-disable-next-line jest/expect-expect
  it('Search results', updateRetry(3), () => {
    cy.searchProduct(locationAvailabilityProducts.orange.name)
    cy.get(locationAvailabilityProducts.orange.link).should('be.visible')
  })

  it('Product specification page', updateRetry(2), () => {
    cy.get(locationAvailabilityProducts.orange.link)
      .should('be.visible')
      .click()
    cy.get(selectors.unavailableLocation)
      .should('be.visible')
      .contains('The selected item cannot be shipped to your location.')
  })
  preserveCookie()
})
