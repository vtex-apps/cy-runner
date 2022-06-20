import selectors from '../common/selectors.js'
import {
  getCostCenterName,
  generateEmailId,
  validateToastMsg,
} from './utils.js'
import { BUTTON_LABEL, TOAST_MSG } from '../validation_text.js'
import { GRAPHL_OPERATIONS } from '../graphql_utils.js'
import { updateRetry } from '../common/support.js'

// Define constants
const APP_NAME = 'vtex.b2b-organizations-graphql'
const APP_VERSION = '0.x'
const APP = `${APP_NAME}@${APP_VERSION}`

export function setOrganizationIdInJSON(organization, costCenter) {
  it(
    'Getting Organization Id from session and set in OrganizationItem',
    { retries: 3, responseTimeout: 5000 },
    () => {
      cy.request('/api/sessions?items=*').then((response) => {
        expect(response.body.namespaces).to.be.exist
        expect(response.body.namespaces['storefront-permissions']).to.be.exist
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
    collections,
    paymentTerms,
    priceTables,
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
              variables,
            },
          }).then((resp) => {
            expect(resp.body.data.updateOrganization.status).to.equal('success')
          })
        })
      })
    }
  )
}

function verifyWidget(organization, costCenter, role) {
  cy.get(selectors.UserWidget)
    .eq(0)
    .should('contain', `Organization: ${organization.organizationName}`)
  cy.get(`${selectors.UserWidget} ${selectors.Tag}`).should(
    'have.text',
    'Active'
  )
  cy.get(selectors.UserWidget)
    .eq(1)
    .should('contain', `Cost Center: ${costCenter}`)
  cy.get(selectors.UserWidget).eq(2).should('contain', `My Role: ${role}`)
}

export function verifySession(organization, costCenter, role) {
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
      verifyWidget(organization, costCenter, role)
    }
  )
}

export function productShouldNotbeAvailableTestCase(product) {
  it(
    'Products from outside collection should not be visible to the user',
    { retries: 2 },
    () => {
      cy.searchProductinB2B(product)
      cy.get(selectors.PageNotFound).should('be.visible')
    }
  )
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
    cy.get(selectors.AddUser).should('be.visible').should('be.disabled')
    cy.get(selectors.AddCostCenter).should('be.visible').should('be.disabled')
    cy.get(
      '.vtex-table__container .ReactVirtualized__Grid__innerScrollContainer'
    )
      .eq(1)
      .contains(costCenter)
      .click()
    cy.get(selectors.CostCenterHeader)
      .contains(BUTTON_LABEL.save)
      .should('be.disabled')
    cy.get(selectors.CostCenterHeader)
      .contains(BUTTON_LABEL.delete)
      .should('be.disabled')
  })
}

export function performImpersonation(user1, email) {
  cy.getVtexItems().then((vtex) => {
    const isSalesManagerOrRep = !!user1.match(/Manager|Representative/i)

    cy.gotoMyOrganization(false, isSalesManagerOrRep)
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === GRAPHL_OPERATIONS.GetUsers) {
        req.continue()
      }
    }).as(GRAPHL_OPERATIONS.GetUsers)
    cy.get('input[type=search]').should('be.visible').clear().type(`${email}`)
    cy.get('input[type=search] ~ span > div > span > svg[class*=search]')
      .should('be.visible')
      .click()

    cy.get(
      `.vtex-table__container:nth-child(1) div[role=rowgroup] > div:nth-child(1)> span.c-disabled`
    )
      .last()
      .should('have.text', email)

    const SalesAdmin = !!user1.match(/Sales Admin/i)
    const childIndex = SalesAdmin ? 5 : 4

    cy.get(
      `div[class=ReactVirtualized__Grid__innerScrollContainer] > div:nth-child(${childIndex}) > div`,
      { timeout: 10000 }
    )
      .should('be.visible')
      .click()

    cy.get(selectors.ImpersonateButton)
      .should('have.text', 'Impersonate User')
      .click()
  })
}

export function userShouldNotImpersonateThisUser(user1, user2, email) {
  it(
    `Verifying ${user1} is not able to impersonate ${user2}`,
    updateRetry(2),
    () => {
      cy.performImpersonation(user1, email)
      validateToastMsg(TOAST_MSG.impersonatePermissionError)
    }
  )
}

function validateImpersonation(user1, email) {
  cy.performImpersonation(user1, email)
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === GRAPHL_OPERATIONS.Session) {
        req.continue()
      }
    }).as(GRAPHL_OPERATIONS.Session)
  })
  validateToastMsg(TOAST_MSG.initializing)
  cy.wait(`@${GRAPHL_OPERATIONS.Session}`)
  // cy.get(selectors.UserWidget).eq(2).should('contain', `My Role: ${user2}`)
  cy.get(selectors.UserImpersonationWidget)
    .should('be.visible')
    .should('contain', `Impersonating: ${email}`)
  cy.get('span').contains(email).should('be.visible')
  cy.get(selectors.MyQuotes).should('be.visible')
  cy.contains('Stop Impersonation').should('be.visible')
}

export function salesUserShouldImpersonateNonSalesUser(user1, user2, email) {
  it(`Verifying ${user1} is able to impersonate ${user2}`, () => {
    validateImpersonation(user1, email)
    cy.get('input[type=search]').should('be.visible')
  })
}

export function stopImpersonation() {
  it(`Verifying stopImpersonation`, () => {
    cy.getVtexItems().then((vtex) => {
      cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
        if (req.body.operationName === GRAPHL_OPERATIONS.GetQuotes) {
          req.continue()
        }
      }).as(GRAPHL_OPERATIONS.GetQuotes)
      cy.contains('Stop Impersonation').should('be.visible').click()
      cy.waitForSession()
      cy.wait(`@${GRAPHL_OPERATIONS.GetQuotes}`)
      cy.get(selectors.UserImpersonationWidget).should('not.exist')
      cy.get(selectors.ProfileLabel).should('be.visible')
    })
  })
}
