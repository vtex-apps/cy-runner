/* eslint-disable jest/expect-expect */
import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import { UsDetails3 } from '../../support/shopper-location/outputvalidation'
import selectors from '../../support/common/selectors'
import {
  addLocation,
  verifyHomePage,
} from '../../support/shopper-location/common'
import { PRODUCTS_LINK_MAPPING } from '../../support/common/utils'

const { country, postalCode, city } = UsDetails3

describe('Validate location availability without address line', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it('Go to home and add location', updateRetry(1), () => {
    addLocation({ country, postalCode })
    verifyHomePage(city, postalCode)
  })

  it('Open product specfication page and verify', updateRetry(1), () => {
    cy.openProduct(PRODUCTS_LINK_MAPPING.orange.name, true)
    cy.get(selectors.AvailabilityHeader).should('be.visible').contains('33180')
  })

  preserveCookie()
})
