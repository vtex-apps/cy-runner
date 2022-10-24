/* eslint-disable jest/valid-expect */
import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import { ROLE_DROP_DOWN } from '../../support/b2b/utils.js'
import b2b from '../../support/b2b/constants.js'
import {
  verifySalesChannel,
  verifyBindings,
  addBindingsWhichShowsOrganization,
} from '../../support/b2b/graphql.js'
import { loginToStoreFront } from '../../support/b2b/login.js'

const { users, gmailCreds } = b2b.OrganizationA

describe('Add binding which shows Organization in profile page', () => {
  loginViaCookies({ storeFrontCookie: false })

  addBindingsWhichShowsOrganization()

  verifySalesChannel(1)

  verifyBindings(users.OrganizationAdmin1, true)

  loginToStoreFront(
    users.OrganizationAdmin1,
    ROLE_DROP_DOWN.OrganizationAdmin,
    gmailCreds
  )

  it('Verify Organization is showing up', () => {
    cy.organizationShouldShowInProfile()
  })

  preserveCookie()
})
