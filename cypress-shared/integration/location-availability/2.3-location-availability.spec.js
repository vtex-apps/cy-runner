/* eslint-disable jest/expect-expect */
import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import { UsDetails3 } from '../../support/shopper-location/outputvalidation'
import selectors from '../../support/common/selectors'
import { verifyHomePage } from '../../support/shopper-location/common'
import { PRODUCTS_LINK_MAPPING } from '../../support/common/utils'

const { country, postalCode, address, city } = UsDetails3

const prefix = 'Shipping not avaiable'

describe('Validate location availability', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Go to home and add location`, updateRetry(1), () => {
    cy.addNewLocation(country, postalCode, address, city)
    cy.get(PRODUCTS_LINK_MAPPING.orange.link).should('be.visible')
    verifyHomePage(city, postalCode)
  })

  it(
    `${prefix} - Open product specfication page and verify`,
    updateRetry(1),
    () => {
      cy.openProduct(PRODUCTS_LINK_MAPPING.orange.name, true)
      cy.get(selectors.AvailabilityHeader)
        .should('be.visible')
        .contains('33180')
    }
  )

  preserveCookie()
})
