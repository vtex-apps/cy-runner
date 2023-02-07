import {
  preserveCookie,
  updateRetry,
  loginViaAPI,
} from '../../support/common/support'
import selectors from '../../support/common/selectors'

const prefix = 'Disable location'

describe('Disable location validation', () => {
  loginViaAPI()

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Open product`, updateRetry(1), () => {
    cy.openStoreFront()
    cy.qe(
      'Address container should be visible in the top left of the home page'
    )
    cy.get(selectors.addressContainer).should('be.visible')
    cy.openProduct('coconuts', true)
    cy.qe(
      "In specification page it should visible 'Set your location to check availability'"
    )
    cy.get(selectors.NoAvailabilityHeader).should(
      'have.text',
      'Set your location to check availability'
    )
  })

  preserveCookie()
})
