import selectors from './cypress-template/common_selectors.js'
import { getCostCenterName, generateEmailId } from './b2b_utils.js'
import { BUTTON_LABEL } from './validation_text.js'

// Define constants
const APP_NAME = 'vtex.b2b-organizations-graphql'
const APP_VERSION = '0.x'
const APP = `${APP_NAME}@${APP_VERSION}`

export function setOrganizationIdInJSON(organization, costCenter) {
  it(
    'Getting Organization Id from session and set in OrganizationItem',
    { retries: 3 },
    () => {
      cy.request('/api/sessions?items=*').then((response) => {
        // Saving organization & costcenter id in organization.json and this id will be deleted this wipe.spec.js
        cy.setOrganizationItem(
          organization,
          response.body.namespaces['storefront-permissions'].organization.value
        )
        cy.setOrganizationItem(
          getCostCenterName(organization, costCenter),
          response.body.namespaces['storefront-permissions'].costcenter.value
        )
      })
    }
  )
}

function addPaymentTermsCollectionPriceTables(organizationItems, organization) {
  const { organizationName, collections, paymentTerms, priceTables } =
    organization
  const id = organizationItems[organizationName]
  return {
    id,
    name: organizationName,
    status: 'active',
    collections: collections,
    paymentTerms: paymentTerms,
    priceTables: priceTables,
  }
}

export function addPaymentTermsCollectionPriceTablesTestCase(organization) {
  it(
    `Add Payment Terms/Collections/Price Tables for ${organization.organizationName}`,
    { retries: 3 },
    () => {
      cy.getVtexItems().then((vtex) => {
        cy.getOrganizationItems().then((organizationItems) => {
          const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`
          const GRAPHQL_UPDATE_ORGANISATION_MUTATION =
            'mutation' +
            '($id:ID!,$name: String!,$status: String!,$collections:[CollectionInput],$paymentTerms:[PaymentTermInput],$priceTables:[String])' +
            '{updateOrganization(id:$id,name:$name,status:$status,collections:$collections,paymentTerms:$paymentTerms,priceTables:$priceTables){' +
            'status}}'

          const variables = addPaymentTermsCollectionPriceTables(
            organizationItems,
            organization
          )

          cy.request({
            method: 'POST',
            url: CUSTOM_URL,
            body: {
              query: GRAPHQL_UPDATE_ORGANISATION_MUTATION,
              variables: variables,
            },
          }).then((resp) => {
            expect(resp.body.data.updateOrganization.status).to.equal('success')
          })
        })
      })
    }
  )
}

export function verifySession(organization) {
  it(
    'Verifying Session items must have expected priceTable and collections',
    { retries: 3 },
    () => {
      cy.request('/api/sessions?items=*').then((response) => {
        expect(response.body.namespaces.profile.priceTables.value).to.equal(
          organization.priceTables
        )
        expect(response.body.namespaces.search.facets.value).to.equal(
          organization.collections
            .map((ele) => `productClusterIds=${ele.id};`)
            .join('')
        )
      })
    }
  )
}

export function productShouldNotbeAvailableTestCase(product) {
  it(
    'Products from outside collection should not be visible to the user',
    { retries: 2 },
    () => {
      cy.searchProduct(product)
      cy.get(selectors.PageNotFound).should('be.visible')
    }
  )
}

export function userAndCostCenterShouldNotBeAdded(
  organization,
  costCenter,
  role
) {
  it(`Trying to add user and cost center in ${organization} with role ${role.dropDownText}`, () => {
    cy.gotoMyOrganization()
    cy.get(selectors.AddUser).should('be.visible').should('be.disabled')
    cy.get(selectors.AddCostCenter).should('be.visible').should('be.disabled')
  })
}

export function userAndCostCenterShouldNotBeEditable(
  organization,
  costCenter,
  role
) {
  it(`Trying to update user and cost center in ${organization} with role ${role.dropDownText}`, () => {
    const { email } = role
    cy.gotoMyOrganization()
    cy.get(selectors.AddUser).should('be.visible')
    cy.contains(generateEmailId(organization, email)).should(
      'have.class',
      'c-disabled'
    )
    cy.contains(costCenter).should('be.visible').click()
    cy.contains(BUTTON_LABEL.save).should('be.disabled')
    cy.contains(BUTTON_LABEL.delete).should('be.disabled')
  })
}
