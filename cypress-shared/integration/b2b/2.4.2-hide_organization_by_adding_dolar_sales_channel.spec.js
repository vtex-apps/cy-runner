/* eslint-disable jest/valid-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { ROLE_DROP_DOWN } from '../../support/b2b/utils.js'
import b2b from '../../support/b2b/constants.js'
import {
  verifySalesChannel,
  verifyBindings,
  addBindingsWhichHidesOrganization,
  addBindingsWhichShowsOrganization,
} from '../../support/b2b/graphql.js'
import { loginToStoreFront } from '../../support/b2b/login.js'

const { users } = b2b.OrganizationB

describe('Add Binding which hides Organization in profile page', () => {
  loginViaCookies({ storeFrontCookie: false })

  addBindingsWhichHidesOrganization()

  verifySalesChannel(0)

  verifyBindings(users.OrganizationAdmin1.email, false)

  loginToStoreFront(users.OrganizationAdmin1, ROLE_DROP_DOWN.OrganizationAdmin)

  it('Verify Organization is not showing up', updateRetry(2), () => {
    cy.reloadOnLastNAttempts(1)
    cy.organizationShouldNotShowInProfile()
  })

  addBindingsWhichShowsOrganization()

  preserveCookie()
})
