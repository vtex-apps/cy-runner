import { verifyLocation } from '../../support/shopper-location/common'
import {
  loginViaAPI,
  preserveCookie,
  updateRetry,
} from '../../support/common/support'
import shopperLocationConstants from '../../support/shopper-location/constants'
import selectors from '../../support/common/selectors'
import { location } from '../../support/shopper-location/outputvalidation'

const prefix = 'Enable location'

describe('Location validation', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Test negative scenarios`, updateRetry(2), () => {
    verifyLocation(location.lat, location.long)
    cy.qe(
      `Now we should see message as (${shopperLocationConstants.locationNotAvailable}) in popup`
    )
    cy.get(selectors.AddressErrorContainer).contains(
      shopperLocationConstants.locationNotAvailable
    )
    cy.get(selectors.countryDropdown).select('CAN')
    cy.qe('Type invalid postal code')
    cy.get(selectors.addressInputContainer).eq(0).type('000000')
    cy.qe(
      `Now user should see the ${shopperLocationConstants.invalidPostalCode} in popup"`
    )
    cy.get(selectors.ChangeLocationError).should(
      'have.text',
      shopperLocationConstants.invalidPostalCode
    )
  })

  preserveCookie()
})
