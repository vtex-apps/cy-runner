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
import selectors from '../../support/common/selectors.js'
import { addAddress } from '../../support/shopper-location/common'
import { syncCheckoutUICustom } from '../../support/common/testcase.js'

const { country, url } = canadaDetails
const { lat, long } = location

const prefix = 'Manual redirect configuration'

describe('Testing local redirect configuration', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  syncCheckoutUICustom()

  updateSettings(country, url)

  addAddress(prefix, { address: canadaDetails, lat, long })

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Verify address`, updateRetry(2), () => {
    scroll()
    cy.get(selectors.addressUpdation)
      .should('be.visible')
      .contains('Essex County, ON, N9V 1K8')
  })

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Get popup with switch button`, updateRetry(2), () => {
    cy.get(selectors.ToastMsgInB2B).should('be.visible', { timeout: 8000 })
    cy.get(selectors.switchButton).click()
  })
  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Page will be redirected to google page`, () => {
    cy.url().should('eq', 'https://www.google.com/')
  })
  preserveCookie()
})
