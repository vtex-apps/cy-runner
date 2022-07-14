import {
  loginAsAdmin,
  loginAsUser,
  preserveCookie,
  scroll,
  updateRetry,
} from '../../support/common/support'
import { updateSettings } from '../../support/shopper-location/settings'
import {
  canadaDetails,
  location,
} from '../../support/shopper-location/outputvalidation'
import shopperLocationSelectors from '../../support/shopper-location/selectors'
import selectors from '../../support/common/selectors.js'
import { addAddress } from '../../support/shopper-location/common'

const { country, url, postalCode } = canadaDetails
const { lat, long } = location

describe('Testing local redirect configuration', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  updateSettings(country, url)

  addAddress({ country, postalCode, lat, long })

  // eslint-disable-next-line jest/expect-expect
  it('Verify address', updateRetry(2), () => {
    cy.get(shopperLocationSelectors.AddressModelLayout).should('not.be.visible')
    cy.get(shopperLocationSelectors.addressContainer).should('be.visible')
    scroll()
    cy.get(shopperLocationSelectors.addressUpdation)
      .should('be.visible')
      .contains('Essex County, ON, N9V 1K8')
  })

  // eslint-disable-next-line jest/expect-expect
  it('Get popup with switch button', updateRetry(2), () => {
    cy.get(selectors.ToastMsgInB2B).should('be.visible')
    cy.get(shopperLocationSelectors.switchButton).click()
  })

  // eslint-disable-next-line jest/expect-expect
  it('Page will be redirected to google page', () => {
    cy.url().should('eq', 'https://www.google.com/')
  })
  preserveCookie()
})
