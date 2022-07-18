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

const { country, PostalCode } = franceDetails

describe('Location deliverable', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it('HomePage', updateRetry(3), () => {
    addAddress({ country, PostalCode })
    cy.scrollTo(0, 500)
    cy.get(locationAvailabilityProducts.orange.link).should('be.visible')
    cy.get(selectors.shippingContent)
      .should('be.visible')
      .contains('FREE Shipping:')
  })

  // eslint-disable-next-line jest/expect-expect
  it('Search results', updateRetry(3), () => {
    cy.searchProduct(locationAvailabilityProducts.orange.name)
  })
  // eslint-disable-next-line jest/expect-expect
  it('Product specification page', updateRetry(2), () => {
    cy.get(locationAvailabilityProducts.orange.link)
      .should('be.visible')
      .click()

    cy.get(selectors.shippingUnavailabilityInformation)
      .should('be.visible')
      .contains(
        'The selected item is not available for pickup near your location.'
      )
  })
  preserveCookie()
})
