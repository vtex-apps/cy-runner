import { UsDetails1 } from '../../support/shopper-location/outputvalidation'
import {
  updateRetry,
  preserveCookie,
  loginViaAPI,
} from '../../support/common/support'
import selectors from '../../support/common/selectors'
import { PRODUCTS_LINK_MAPPING } from '../../support/common/utils'

const { country1, postalCode1 } = UsDetails1

describe('Verify-Location-availability', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip(
    'Adding Location & Verify location Availability',
    updateRetry(1),
    () => {
      cy.addNewLocation(country1, postalCode1)
      // cy.get('div[class*=vtex-modal-layout]').should('not.be.visible')
      cy.scrollTo(0, 500)
      cy.getVtexItems().then((vtex) => {
        cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
          if (req.body.operationName === 'updateOrderFormShipping') {
            req.continue()
          }
        }).as('updateOrderFormShipping')
        cy.get(selectors.addressContainer).should('be.visible')
        cy.get(selectors.AddressCity).contains('Pomona')
        cy.get(selectors.AddressZip).contains('91766')
        cy.get(selectors.Distance).contains('Distance:')
        cy.wait('@updateOrderFormShipping', { timeout: 20000 })
      })
    }
  )

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Search results & product specification', updateRetry(3), () => {
    cy.openProduct(PRODUCTS_LINK_MAPPING.orange.name, true)
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.get('body').then(($body) => {
      expect(
        $body.find(selectors.VerifyMaxItem).length
        // eslint-disable-next-line jest/valid-expect
      ).to.equal(3)
    })
    cy.get(selectors.OrderByFaster).should('be.visible')
  })

  preserveCookie()
})
