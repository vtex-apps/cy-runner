import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import selectors from '../../support/common/selectors'

const prefix = 'Disable location'

describe('Location validation', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Open product`, updateRetry(1), () => {
    cy.openStoreFront()
    cy.get(selectors.addressContainer).should('be.visible')
    cy.openProduct('coconuts', true)
    cy.get(selectors.NoAvailabilityHeader).should(
      'have.text',
      'Set your location to check availability'
    )
  })

  preserveCookie()
})
