/* eslint-disable jest/expect-expect */
import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import { UsDetails4 } from '../../support/shopper-location/outputvalidation'
import { verifyHomePage } from '../../support/location-availability/common'

const { country, postalCode, city, address } = UsDetails4

describe('Verify distance not show in Home page', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it(
    'Go to home add location & verify distance not shows',
    updateRetry(1),
    () => {
      cy.addNewLocation(country, postalCode, address)
      verifyHomePage(city, postalCode, true)
    }
  )

  preserveCookie()
})
