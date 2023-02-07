/* eslint-disable jest/valid-expect */
import {
  graphql,
  updateShippingPolicy,
} from '../../support/common/shipping-policy.graphql'
import data from '../../support/location-availability/shipping-policy.json'
import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import { deleteAllPickupPoints } from '../../support/location-availability/support'

describe('Wipe the pickup points', () => {
  loginViaCookies({ storeFrontCookie: false })

  deleteAllPickupPoints()

  // If we leave the shipping policy active then it is forcing us to use pickup points in checkout
  // So, make shipping policy as inactive
  it('Update shipping policy status to inactive', () => {
    cy.qe(
      'If we leave the shipping policy active then it is forcing us to use pickup points in checkout,So make shipping policy as inactive'
    )
    graphql(
      updateShippingPolicy(data.ship1, { status: false, pickup: false }),
      (response) => {
        expect(response.status).to.equal(200)
      }
    )
    graphql(
      updateShippingPolicy(data.ship2, { status: false, pickup: false }),
      (response) => {
        expect(response.status).to.equal(200)
      }
    )
  })
  preserveCookie()
})
