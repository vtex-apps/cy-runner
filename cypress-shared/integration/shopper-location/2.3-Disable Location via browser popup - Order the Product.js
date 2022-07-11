import {
  preserveCookie,
  loginAsAdmin,
  loginAsUser,
} from '../../support/common/support'
import { orderProductTestCase } from '../../support/shopper-location/common'
import { UsDetails } from '../../support/shopper-location/output.validation'

const { country, postalCode } = UsDetails

const prefix = 'Disable location'

describe(`${prefix}- via browser popup - Order the Product`, () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  orderProductTestCase({ country, postalCode })

  preserveCookie()
})
