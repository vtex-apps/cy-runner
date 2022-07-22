/* eslint-disable jest/expect-expect */
import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import { UsDetails2 } from '../../support/shopper-location/outputvalidation'
import selectors from '../../support/common/selectors'
import { addLocation } from '../../support/shopper-location/common'
import { PRODUCTS_LINK_MAPPING } from '../../support/common/utils'

const { country, postalCode } = UsDetails2

describe('Validate location non availability', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it('HomePage', updateRetry(1), () => {
    addLocation({ country, postalCode })
    cy.get(PRODUCTS_LINK_MAPPING.orange.link).should('be.visible')
    cy.get(selectors.shippingUnavailable).contains('Unavailable for')
  })

  it('Open product specfication page and verify', updateRetry(1), () => {
    cy.openProduct(PRODUCTS_LINK_MAPPING.orange.name, true)
    cy.get(selectors.shippingUnavailabilityInformation)
      .should('be.visible')
      .contains('The selected item cannot be shipped to your location.')
  })

  preserveCookie()
})
