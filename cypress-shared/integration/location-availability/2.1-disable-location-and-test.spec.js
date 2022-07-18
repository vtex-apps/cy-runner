import {
  preserveCookie,
  updateRetry,
  loginAsAdmin,
  loginAsUser,
} from '../../support/common/support'
import selectors from '../../support/common/selectors'

const prefix = 'Disable location'

describe('Location validation', () => {
  before(() => {
    loginAsAdmin()
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it(`${prefix} - Open product`, updateRetry(3), () => {
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
