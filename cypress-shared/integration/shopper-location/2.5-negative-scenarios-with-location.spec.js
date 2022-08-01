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
    cy.get(selectors.AddressErrorContainer).contains(
      shopperLocationConstants.locationNotAvailable
    )
    cy.get(selectors.countryDropdown).select('CAN')
    cy.get(selectors.addressInputContainer).eq(0).type('000000')
    cy.get(selectors.ChangeLocationError).should(
      'have.text',
      shopperLocationConstants.invalidPostalCode
    )
  })

  preserveCookie()
})
