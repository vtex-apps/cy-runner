import {
  loginAsAdmin,
  loginAsUser,
  preserveCookie,
} from '../../support/common/support'
import { updateSettings } from '../../support/shopper-location/settings'
import {
  canadaDetails,
  location,
} from '../../support/shopper-location/output.validation'
import { addAddress } from '../../support/shopper-location/common'

const { country, url, postalCode } = canadaDetails
const { lat, long } = location

describe('Test Locale with Auto redirect', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  updateSettings(country, url, { automaticRedirect: true })

  addAddress({ country, postalCode, lat, long })

  // eslint-disable-next-line jest/expect-expect
  it('Now site should force redirect to google', () => {
    cy.url().should('eq', 'https://www.google.com/')
  })

  preserveCookie()
})
