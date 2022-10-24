/* eslint-disable jest/valid-expect */
import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import {
  ROLE_DROP_DOWN,
} from '../../support/b2b/utils.js'
import b2b from '../../support/b2b/constants.js'
import {
  verifySalesChannel,
  verifyBindings,
  addBindingsWhichHidesOrganization,
  addBindingsWhichShowsOrganization,
} from '../../support/b2b/graphql.js'
import { loginToStoreFront } from '../../support/b2b/login.js'

const { users, gmailCreds } = b2b.OrganizationB

describe('Add Binding which hides Organization in profile page', () => {
  loginViaCookies({ storeFrontCookie: false })

  addBindingsWhichHidesOrganization()

  verifySalesChannel(0)

  verifyBindings(users.OrganizationAdmin1, false)

  loginToStoreFront(
    users.OrganizationAdmin1,
    ROLE_DROP_DOWN.OrganizationAdmin,
    gmailCreds
  )


  it('Verify Organization is not showing up', () => {
    cy.organizationShouldNotShowInProfile()
  })

  addBindingsWhichShowsOrganization()

  preserveCookie()
})
