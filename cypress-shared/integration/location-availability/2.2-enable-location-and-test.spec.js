import {
  preserveCookie,
  updateRetry,
  loginAsAdmin,
  loginAsUser,
} from '../../support/common/support'
import { franceDetails } from '../../support/shopper-location/outputvalidation'
import selectors from '../../support/common/selectors'
import { verifyUpdatedAddress } from '../../support/location-availability/support'
import { addAddress } from '../../support/shopper-location/common'

const prefix = 'Enable location'
const postalCode = '90290'
const product = 'coconuts'

describe('Location validation', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  addAddress({ address: franceDetails })

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Open product`, updateRetry(1), () => {
    cy.get(selectors.addressContainer).should('be.visible')
    cy.openProduct(product, true)
  })

  verifyUpdatedAddress(postalCode)

  // eslint-disable-next-line jest/expect-expect
  it('Ordering the product', updateRetry(3), () => {
    cy.orderProduct()
  })

  preserveCookie()
})
