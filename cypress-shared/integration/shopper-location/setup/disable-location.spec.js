import { updateRetry } from '../../../support/common/support'

describe('Location Scenarios', () => {
  // eslint-disable-next-line jest/expect-expect
  it(`Disable Location`, updateRetry(3), () => {
    cy.setBrowerPermission('env', 'block')
  })
})
