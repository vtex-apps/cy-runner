import { updateRetry } from '../../../support/common/support'

describe('Location Scenarios', () => {
  // eslint-disable-next-line jest/expect-expect
  it(`Enable Location`, updateRetry(3), () => {
    cy.setBrowerPermission('env', 'allow')
  })
})
