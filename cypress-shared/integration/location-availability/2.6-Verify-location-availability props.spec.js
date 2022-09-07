import { UsDetails3 } from '../../support/shopper-location/outputvalidation'
import {
  addLocation,
  verifyHomePage,
} from '../../support/shopper-location/common'
import {
  updateRetry,
  preserveCookie,
  loginViaAPI,
} from '../../support/common/support'
import selectors from '../../support/common/selectors'
import { PRODUCTS_LINK_MAPPING } from '../../support/common/utils'

const { country, postalCode, city } = UsDetails3

const prefix = 'Location availability props'

describe('Verify location availability props', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/no-disabled-tests
  it(
    `${prefix} - Adding Location & Verify location Availability`,
    updateRetry(1),
    () => {
      addLocation({ country, postalCode })
      verifyHomePage(city, postalCode)
    }
  )

  // eslint-disable-next-line jest/no-disabled-tests
  it(
    `${prefix} - Search results & product specification`,
    updateRetry(3),
    () => {
      cy.openProduct(PRODUCTS_LINK_MAPPING.orange.name, true)
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.get('body').then(($body) => {
        expect(
          $body.find(selectors.VerifyMaxItem).length
          // eslint-disable-next-line jest/valid-expect
        ).to.equal(3)
      })
      cy.get(selectors.OrderByFaster).should('be.visible')
    }
  )

  preserveCookie()
})
