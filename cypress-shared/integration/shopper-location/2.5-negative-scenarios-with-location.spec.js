import { verifyLocation } from '../../support/shopper-location/common'
import {
  loginAsAdmin,
  loginAsUser,
  preserveCookie,
  updateRetry,
} from '../../support/common/support'
import shopperLocationConstants from '../../support/shopper-location/constants'
import shopperLocationSelectors from '../../support/shopper-location/selectors'
import { location } from '../../support/shopper-location/output.validation'

const prefix = 'Enable location'

describe('Location validation', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  // eslint-disable-next-line jest/no-disabled-tests
  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Test negative scenarios`, updateRetry(2), () => {
    verifyLocation(location.lat, location.long)
    cy.get(shopperLocationSelectors.AddressErrorContainer).contains(
      shopperLocationConstants.locationNotAvailable
    )
    cy.get(shopperLocationSelectors.countryDropdown).select('CAN')
    cy.get(shopperLocationSelectors.addressInputContainer).eq(0).type('000000')
    cy.get(shopperLocationSelectors.ChangeLocationError).should(
      'have.text',
      shopperLocationConstants.invalidPostalCode
    )
  })

  preserveCookie()
})
