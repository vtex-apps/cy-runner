import {
  preserveCookie,
  loginAsAdmin,
  loginAsUser,
} from '../../support/common/support'
import { orderProductTestCase } from '../../support/shopper-location/common'
import {
  UsDetails,
  location,
} from '../../support/shopper-location/output.validation'

const { country, postalCode } = UsDetails

const prefix = 'Enable location'

describe(`${prefix}- via browser popup - Order the Product`, () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  orderProductTestCase({
    lat: location.lat,
    long: location.long,
    country,
    postalCode,
  })

  preserveCookie()
})
