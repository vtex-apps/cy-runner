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
    cy.qe('Address should be visible in the top left of the home page')
    cy.get(selectors.addressContainer).should('be.visible')
    cy.openProduct('coconuts', true)
    cy.qe(
      "'Set your location to check availability' should be visible on the specification page"
    )
    cy.get(selectors.NoAvailabilityHeader).should(
      'have.text',
      'Set your location to check availability'
    )
  })

  preserveCookie()
})
