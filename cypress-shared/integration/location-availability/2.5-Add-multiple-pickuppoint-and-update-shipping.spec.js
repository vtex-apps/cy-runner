import {
  updateRetry,
  preserveCookie,
  loginViaAPI,
} from '../../support/common/support'
import { addPickUpPoint } from '../../support/location-availability/support'
import {
  graphql,
  updateShippingPolicy,
} from '../../support/common/shipping-policy.graphql'
import data from '../../support/location-availability/shipping-policy.json'

const prefix = 'Multiple pickup points'

describe('Adding Multiple pickup point & Update Shipping', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Add Multiple PickUp Point`, updateRetry(1), () => {
    cy.visit('/admin/app/pickup-points')
    for (let id = 1; id <= 4; id++) {
      addPickUpPoint(`Location availability pickup Point ${id}`, id)
    }
  })

  it(`${prefix} - Add pickup points in shipping policy`, updateRetry(3), () => {
    data.ship1.shippingPolicy.pickupPointsSettings.pickupPointIds.push(
      '1',
      '2',
      '3'
    )
    graphql(
      updateShippingPolicy(data.ship1, { status: true, pickup: false }),
      (response) => {
        // eslint-disable-next-line jest/valid-expect
        expect(response.status).to.equal(200)
      }
    )
  })

  it(
    'Add pickup points in Location Availability shipping policy',
    updateRetry(3),
    () => {
      data.ship2.shippingPolicy.pickupPointsSettings.pickupPointIds.push('4')
      graphql(
        updateShippingPolicy(data.ship2, { status: true, pickup: false }),
        (response) => {
          // eslint-disable-next-line jest/valid-expect
          expect(response.status).to.equal(200)
        }
      )
    }
  )

  preserveCookie()
})
