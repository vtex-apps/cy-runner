/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/consistent-test-it */
/* eslint-disable jest/valid-expect */
import { getCostCenterName } from '../../support/b2b/utils.js'
import b2b from '../../support/b2b/constants.js'
import {
  ENTITIES,
  FAIL_ON_STATUS_CODE,
  VTEX_AUTH_HEADER,
} from '../../support/common/constants.js'
import { updateRetry, testSetup } from '../../support/common/support.js'
import { deleteOrganization } from '../../support/b2b/graphql.js'

const config = Cypress.env()

// Constants
const { name } = config.workspace

// Define constants
const APP_NAME = 'vtex.b2b-organizations-graphql'
const APP_VERSION = '*.x'
const APP = `${APP_NAME}@${APP_VERSION}`

function deleteCostCenter(organization, costCenter) {
  it(`Delete ${costCenter.name} - ${organization}`, updateRetry(2), () => {
    cy.getVtexItems().then((vtex) => {
      const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`

      const GRAPHQL_DELETE_ORAGANIZATION_MUTATION =
        'mutation' + '($id: ID!)' + '{deleteCostCenter(id: $id){status}}'

      cy.getOrganizationItems().then((items) => {
        const costCenterId =
          items[getCostCenterName(organization, costCenter.name)]

        if (costCenterId) {
          cy.request({
            method: 'POST',
            url: CUSTOM_URL,
            body: {
              query: GRAPHQL_DELETE_ORAGANIZATION_MUTATION,
              variables: {
                id: costCenterId,
              },
            },
            headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
            ...FAIL_ON_STATUS_CODE,
          }).then((response) => {
            expect(response.status).to.equal(200)
            expect(response.body.data.deleteCostCenter.status).to.equal(
              'success'
            )
          })
        }
      })
    })
  })
}

function deleteUsersFromMasterData() {
  /* eslint-disable jest/expect-expect */
  it('Delete Users from master data', () => {
    cy.searchInMasterData(
      ENTITIES.CLIENTS,
      `*${Cypress.env().workspace.name}*`
    ).then((datas) => {
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

  testSetup(false)

  deleteUsersFromMasterData()
  deleteCostCenter(organizationA, costCenter1)
  deleteCostCenter(organizationA, costCenter2)
  deleteCostCenter(organizationB, costCenterB1)
  it(`Deleting Organizations which we created in this workspace ${name}`, () => {
    deleteOrganization(name)
  })
  it(`Deleting Organizations Requests which we created in this workspace ${name}`, () => {
    deleteOrganization(name, true)
  })
})
