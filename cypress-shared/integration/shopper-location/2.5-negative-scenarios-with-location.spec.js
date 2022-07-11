import { verifyLocation } from '../../support/shopper-location/common'
import {
  loginAsAdmin,
  loginAsUser,
  preserveCookie,
  updateRetry,
} from '../../support/common/support'
import shopperLocationConstants from '../../support/shopper-location/constants'
import shopperLocationSelectors from '../../support/shopper-location/selectors'

const prefix = 'Enable location'

describe('Location validation', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip(`${prefix} - Test negative scenarios`, updateRetry(3), () => {
    verifyLocation()
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
