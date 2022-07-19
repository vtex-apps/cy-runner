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

const { country, postalCode } = canadaDetails1

describe('Location deliverable', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it('HomePage', updateRetry(1), () => {
    addLocation({ country, postalCode })
    cy.get(locationAvailabilityProducts.orange.link).should('be.visible')
    cy.get(selectors.shippingUnavailable).contains('Unavailable for')
  })

  it('Open product specfication page and verify', updateRetry(1), () => {
    cy.openProduct(locationAvailabilityProducts.orange.name, true)
    cy.get(selectors.shippingUnavailabilityInformation)
      .should('be.visible')
      .contains('The selected item cannot be shipped to your location.')
  })

  preserveCookie()
})
