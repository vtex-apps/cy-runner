import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import {
  UsDetails,
  location,
} from '../../support/shopper-location/outputvalidation'
import selectors from '../../support/common/selectors'
import { verifyUpdatedAddress } from '../../support/location-availability/support'
import { addAddress } from '../../support/shopper-location/common'

const prefix = 'Enable location'
const postalCode = '90290'
const product = 'coconuts'

describe('Enable location validation', () => {
  loginViaAPI()

  addAddress(prefix, {
    address: UsDetails,
    lat: location.lat,
    long: location.long,
  })

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Open product`, updateRetry(1), () => {
    cy.get(selectors.addressContainer).should('be.visible')
    cy.openProduct(product, true)
  })

  verifyUpdatedAddress(postalCode)

  // eslint-disable-next-line jest/expect-expect
  it('Ordering the product', updateRetry(2), () => {
    cy.orderProduct()
  })

  preserveCookie()
})
