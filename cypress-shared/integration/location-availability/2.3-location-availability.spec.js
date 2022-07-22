import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import { franceDetails } from '../../support/shopper-location/outputvalidation'
import selectors from '../../support/common/selectors'
import { addAddress } from '../../support/shopper-location/common'
import { PRODUCTS_LINK_MAPPING } from '../../support/common/utils'

describe('Location deliverable', () => {
  loginViaAPI()

  addAddress({ address: franceDetails })

  // eslint-disable-next-line jest/expect-expect
  it('Verify shipping content', updateRetry(2), () => {
    cy.get(PRODUCTS_LINK_MAPPING.orange.link).should('be.visible')
    cy.get(selectors.shippingContent)
      .should('be.visible')
      .contains('FREE Shipping:')
  })

  // eslint-disable-next-line jest/expect-expect
  it('Open product specfication page and verify', updateRetry(2), () => {
    cy.openProduct(PRODUCTS_LINK_MAPPING.orange.name, true)
    cy.get(selectors.storeUnavailabilityInformation)
      .should('be.visible')
      .contains(
        'The selected item is not available for pickup near your location.'
      )
  })

  preserveCookie()
})
