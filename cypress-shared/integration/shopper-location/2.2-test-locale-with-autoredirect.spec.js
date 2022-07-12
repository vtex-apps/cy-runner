/* eslint-disable cypress/no-unnecessary-waiting */

import { updateSettings } from '../../support/shopper-location/settings'
import {
  canadaDetails,
  location,
} from '../../support/shopper-location/output.validation'
import {
  loginAsAdmin,
  loginAsUser,
  preserveCookie,
  updateRetry,
} from '../../support/common/support'
import { addAddress } from '../../support/shopper-location/common'

const { country, url, canadaPostalCode } = canadaDetails
const { lat, long } = location

describe('Test Locale with Auto redirect', () => {
  // testSetup()
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })
  updateSettings(country, url, { automaticRedirect: true })

  // eslint-disable-next-line jest/expect-expect
  it(
    'Go to store front and add canada shipping address',
    updateRetry(2),
    () => {
      addAddress({ country, canadaPostalCode, lat, long })
    }
  )

  // eslint-disable-next-line jest/expect-expect
  it('Now site should force redirect to google', () => {
    cy.url().should('eq', 'https://www.google.com/')
  })

  preserveCookie()
})
