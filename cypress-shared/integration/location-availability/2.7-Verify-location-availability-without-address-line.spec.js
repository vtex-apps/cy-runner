/* eslint-disable jest/expect-expect */
import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import { UsDetails3 } from '../../support/shopper-location/outputvalidation'
import selectors from '../../support/common/selectors'
import { addLocation } from '../../support/shopper-location/common'
import { PRODUCTS_LINK_MAPPING } from '../../support/common/utils'

const { country, postalCode } = UsDetails3

describe('Validate location availability without address line', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it('Go to home and add location', updateRetry(1), () => {
    addLocation({ country, postalCode })
    cy.scrollTo(0, 500)
    cy.getVtexItems().then((vtex) => {
      cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
        if (req.body.operationName === 'updateOrderFormShipping') {
          req.continue()
        }
      }).as('updateOrderFormShipping')
      cy.get(selectors.addressContainer).should('be.visible')
      cy.get(selectors.AddressCity).contains('Aventura')
      cy.get(selectors.AddressZip).contains('33180')
      cy.get(selectors.Distance).contains('Distance:')
      cy.wait('@updateOrderFormShipping', { timeout: 20000 })
    })
  })

  it('Open product specfication page and verify', updateRetry(1), () => {
    cy.openProduct(PRODUCTS_LINK_MAPPING.orange.name, true)
    cy.get(selectors.AvailabilityHeader).should('be.visible').contains('33180')
  })

  preserveCookie()
})
