/* eslint-disable cypress/no-unnecessary-waiting */

import {
  loginAsAdmin,
  loginAsUser,
  preserveCookie,
  updateRetry,
} from '../../support/common/support'
import { updateSettings } from '../../support/shopper-location/settings'
import { canadaDetails } from '../../support/shopper-location/output.validation'
import shopperLocationSelectors from '../../support/shopper-location/selectors'
import selectors from '../../support/common/selectors.js'
import { addAddress } from '../../support/shopper-location/common'

const { country, url, canadaPostalCode } = canadaDetails

describe('Testing local redirect configuration', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  updateSettings(country, url)

  // eslint-disable-next-line jest/expect-expect
  it(
    'Go to store front and add canada shipping address',
    updateRetry(1),
    () => {
      addAddress(country, canadaPostalCode)
    }
  )

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
