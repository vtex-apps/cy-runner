/* eslint-disable jest/valid-expect */
import { getCostCenterName } from '../../support/b2b_utils.js'
import b2b from '../../support/b2b_constants.js'
import { ENTITIES } from '../../support/cypress-template/common_constants.js'

// Define constants
const APP_NAME = 'vtex.b2b-organizations-graphql'
const APP_VERSION = '*.x'
const APP = `${APP_NAME}@${APP_VERSION}`

function deleteOrganization(organization, organizationRequest = false) {
  // Default is organization, if organization request is true then delete organization request
  const func = organizationRequest ? 'Request' : ''

  test(`Delete ${organization}`, () => {
    cy.getVtexItems().then((vtex) => {
      const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`

      const GRAPHQL_DELETE_MUTATION =
        'mutation' +
        '($id: ID!)' +
        `{deleteOrganization${func}(id: $id){status}}`

      cy.getOrganizationItems().then((items) => {
        cy.request({
          method: 'POST',
          url: CUSTOM_URL,
          body: {
            query: GRAPHQL_DELETE_MUTATION,
            variables: {
              id: items[
                organizationRequest ? `${organization}request` : organization
              ],
            },
          },
        }).then((resp) => {
          expect(resp.body.data[`deleteOrganization${func}`].status).to.equal(
            'success'
          )
        })
      })
    })
  })
}

function deleteCostCenter(organization, costCenter) {
  test(`Delete ${costCenter.name} - ${organization}`, () => {
    cy.getVtexItems().then((vtex) => {
      const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`

      const GRAPHQL_DELETE_ORAGANIZATION_MUTATION =
        'mutation' + '($id: ID!)' + '{deleteCostCenter(id: $id){status}}'

      cy.getOrganizationItems().then((items) => {
        cy.request({
          method: 'POST',
          url: CUSTOM_URL,
          body: {
            query: GRAPHQL_DELETE_ORAGANIZATION_MUTATION,
            variables: {
              id: items[getCostCenterName(organization, costCenter.name)],
            },
          },
        }).then((resp) => {
          expect(resp.body.data.deleteCostCenter.status).to.equal('success')
        })
      })
    })
  })
}

function deleteUsersFromMasterData() {
  test('Delete Users from master data', () => {
    cy.searchInMasterData(ENTITIES.CLIENTS, '*syedbitcot*').then((datas) => {
      for (const { id } of datas) {
        cy.deleteDocumentInMasterData(ENTITIES.CLIENTS, id)
      }
    })
  })
}

describe('Wipe datas', () => {
  const {
    organizationName: organizationA,
    costCenter1,
    costCenter2,
  } = b2b.OrganizationA

  const { organizationName: organizationB, costCenter1: costCenterB1 } =
    b2b.OrganizationB

  deleteCostCenter(organizationA, costCenter1)
  deleteCostCenter(organizationA, costCenter2)
  deleteOrganization(organizationA)
  deleteCostCenter(organizationB, costCenterB1)
  deleteOrganization(organizationB)
  deleteUsersFromMasterData()
})
