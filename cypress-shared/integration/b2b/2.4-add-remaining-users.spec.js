/* eslint-disable jest/valid-expect */
import { testSetup } from '../../support/common/common_support.js'
import { ROLE_ID_EMAIL_MAPPING, OTHER_ROLES } from '../../support/b2b/utils.js'
import { addUserViaGraphql } from '../../support/b2b/add_users.js'

describe('Add Sales Users via Graphql', () => {
  testSetup(false)

  it('Set roles in organization JSON', { retries: 3 }, () => {
    cy.getVtexItems().then((vtex) => {
      const APP_NAME = 'vtex.storefront-permissions'
      const APP_VERSION = '1.x'
      const APP = `${APP_NAME}@${APP_VERSION}`

      const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`
      const GRAPHQL_LIST_ROLE_QUERY = 'query' + '{listRoles{id,name}}'

      cy.request({
        method: 'POST',
        url: CUSTOM_URL,
        body: {
          query: GRAPHQL_LIST_ROLE_QUERY,
        },
      }).then((response) => {
        const rolesObject = response.body.data.listRoles.filter((r) =>
          OTHER_ROLES.includes(r.name)
        )

        expect(rolesObject.length).to.equal(3)
        rolesObject.map((r) => cy.setOrganizationItem(`${r.name}-id`, r.id))
      })
    })
  })

  const roles = Object.keys(ROLE_ID_EMAIL_MAPPING)

  roles.forEach((r) => {
    addUserViaGraphql(r)
  })
})
