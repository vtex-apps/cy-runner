import {
  loginViaAPI,
  preserveCookie,
  updateRetry,
} from '../../support/common/support'
import { verifyLocation } from '../../support/shopper-location/common'
import shopperLocationConstants from '../../support/shopper-location/constants'
import selectors from '../../support/common/selectors'

const prefix = 'Disable location'

describe('Location validation', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Test negative scenarios`, updateRetry(2), () => {
    cy.qe(
      "After disabling location here we click on Find location.It shows an message as 'Failed to find your location. Please check that you have granted permission for this site to use your location.'"
    )
    verifyLocation()
    cy.qe('The fail message will be verified')
    cy.get(selectors.AddressErrorContainer).should(
      'have.text',
      shopperLocationConstants.faildFindLocation
    )
  })

  preserveCookie()
})
