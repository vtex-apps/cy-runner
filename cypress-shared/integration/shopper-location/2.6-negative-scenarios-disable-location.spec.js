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
    verifyLocation()
    cy.qe(
      `Now we should see message as (${shopperLocationConstants.faildFindLocation}) in popup`
    )
    cy.get(selectors.AddressErrorContainer).should(
      'have.text',
      shopperLocationConstants.faildFindLocation
    )
  })

  preserveCookie()
})
