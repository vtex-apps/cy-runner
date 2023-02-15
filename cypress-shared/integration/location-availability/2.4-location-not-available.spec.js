import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import { canadaDetails } from '../../support/shopper-location/outputvalidation'
import selectors from '../../support/common/selectors'
import { addAddress } from '../../support/shopper-location/common'
import { PRODUCTS_LINK_MAPPING } from '../../support/common/utils'

const prefix = 'Pickup not available'

describe('Validate location non availability', () => {
  loginViaAPI()

  addAddress(prefix, { address: canadaDetails })

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Verify shipping content`, updateRetry(2), () => {
    cy.qe('Product image should be visible on the home page')
    cy.get(PRODUCTS_LINK_MAPPING.orange.link).should('be.visible')
    cy.qe('For the given shipping address the shipping is unavailable')
    cy.get(selectors.locationUnavailable)
      .should('be.visible')
      .contains('Shipping: Unavailable for')
  })

  // eslint-disable-next-line jest/expect-expect
  it(
    `${prefix} - Open product specfication page and verify`,
    updateRetry(2),
    () => {
      cy.openProduct(PRODUCTS_LINK_MAPPING.orange.name, true, true)
      cy.qe(
        'Verifying the given shipping address in specification page is not available for pickup near your location'
      )
      cy.get(selectors.storeUnavailabilityInformation)
        .should('be.visible')
        .contains(
          'The selected item is not available for pickup near your location.'
        )
    }
  )

  preserveCookie()
})
