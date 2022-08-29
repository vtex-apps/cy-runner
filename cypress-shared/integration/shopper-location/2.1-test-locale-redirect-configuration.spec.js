import {
  loginViaAPI,
  preserveCookie,
  scroll,
  updateRetry,
} from '../../support/common/support'
import { updateSettings } from '../../support/shopper-location/settings'
import {
  poland,
  location,
} from '../../support/shopper-location/outputvalidation'
import selectors from '../../support/common/selectors.js'
import { addAddress } from '../../support/shopper-location/common'
import { syncCheckoutUICustom } from '../../support/common/testcase.js'

const { country, url } = poland
const { lat, long } = location

const prefix = 'Manual redirect configuration'

describe('Testing local redirect configuration', () => {
  loginViaAPI()

  syncCheckoutUICustom()

  updateSettings(country, url)

  addAddress(prefix, { address: poland, lat, long })

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Verify address`, updateRetry(2), () => {
    scroll()
    cy.get(selectors.addressUpdation)
      .should('be.visible')
      .contains('Warszawa, Masovian Voivodeship, 00-014')
  })

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Get popup with switch button`, updateRetry(2), () => {
    cy.get(selectors.ToastMsgInB2B).should('be.visible', { timeout: 10000 })
    cy.get(selectors.switchButton).should('be.visible').click()
  })

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Page will be redirected to google page`, () => {
    cy.url().should('eq', 'https://www.google.com/')
  })

  preserveCookie()
})
