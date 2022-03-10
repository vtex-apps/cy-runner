import selectors from '../../cypress-template/common_selectors.js'
import { OTHER_ROLES } from './b2b_utils.js'
import { GRAPHL_OPERATIONS } from './graphql_utils.js'
import { BUTTON_LABEL } from './validation_text.js'
import { FAIL_ON_STATUS_CODE } from '../../cypress-template/common_constants.js'

// Define constants
const APP_NAME = 'vtex.b2b-organizations-graphql'
const APP_VERSION = '0.x'
const APP = `${APP_NAME}@${APP_VERSION}`

function getOrganisationPayload(
  organisation,
  { costCenterName, costCenterAddress },
  email
) {
  return {
    name: organisation,
    b2bCustomerAdmin: {
      firstName: 'Robot',
      lastName: email,
      email,
    },
    defaultCostCenter: {
      name: costCenterName,
      ...costCenterAddress,
    },
  }
}

function verifyOrganizationData(
  organizationName,
  b2bCustomerAdmin,
  defaultCostCenter,
  invalidEmail = false
) {
  cy.url().then((url) => {
    if (url.includes('blank')) {
      // Local storage holds previous organization request information. So, Clear Local Storage
      cy.clearLocalStorage()
      cy.visit('/', {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      })
      cy.intercept('POST', 'https://rc.vtex.com.br/api/events').as('EVENTS')
      cy.wait('@EVENTS')
    }
  })
  cy.get('body').then(($body) => {
    if ($body.find(selectors.PopupMsg).length)
      cy.get('button > div')
        .contains(BUTTON_LABEL.create)
        .should('be.visible')
        .click()
  })

  const { firstName, lastName, email } = b2bCustomerAdmin
  cy.get(selectors.OrganisationSignup, { timeout: 25000 })
    .should('be.visible')
    .click()
  cy.get(selectors.PageNotFound, { timeout: 10000 }).should('not.exist')
  organizationName
    ? cy
        .get(selectors.OrganizationName)
        .clear()
        .type(organizationName)
        .should('have.value', organizationName)
    : cy.get(selectors.OrganizationName).clear()
  cy.get(selectors.FirstNameinB2B)
    .clear()
    .type(firstName)
    .should('have.value', firstName)
  cy.get(selectors.LastNameinB2B)
    .clear()
    .type(lastName)
    .should('have.value', lastName)
  cy.get(selectors.EmailinB2B)
    .clear()
    .type(invalidEmail ? invalidEmail : email)
    .should('have.value', invalidEmail ? invalidEmail : email)
  if (defaultCostCenter) {
    cy.get(selectors.CostCenter)
      .clear()
      .type(defaultCostCenter.name)
      .should('have.value', defaultCostCenter.name)
    cy.fillAddressInCostCenter(defaultCostCenter)
  }
}

export function createAndApproveOrganizationRequestTestCase(
  organization,
  { costCenterName, costCenterAddress },
  email
) {
  it(
    `Creating ${organization} via storefront & Approving ${organization} via graphql`,
    { retries: 3 },
    () => {
      cy.getVtexItems().then((vtex) => {
        const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`
        const { name, b2bCustomerAdmin, defaultCostCenter } =
          getOrganisationPayload(
            organization,
            {
              costCenterName,
              costCenterAddress,
            },
            email
          )
        verifyOrganizationData(name, b2bCustomerAdmin, defaultCostCenter)
        cy.waitForGraphql(
          GRAPHL_OPERATIONS.CreateOrganizationRequest,
          selectors.SubmitOrganization
        ).then((req) => {
          cy.get(selectors.PopupMsg).contains('pending approval')
          const { id } = req.response.body.data.createOrganizationRequest
          // Saving organizationRequest in organization.json and this request will be deleted this wipe.spec.js
          cy.setOrganizationItem(`${organization}request`, id)
          const GRAPHQL_ORAGANIZATION_APPROVAL_MUTATION =
            'mutation' +
            '($id: ID!,$status: String!)' +
            '{updateOrganizationRequest(id: $id,status:$status){id}}'
          const variables = {
            id,
            status: 'approved',
          }
          cy.request({
            method: 'POST',
            url: CUSTOM_URL,
            body: {
              query: GRAPHQL_ORAGANIZATION_APPROVAL_MUTATION,
              variables: variables,
            },
            ...FAIL_ON_STATUS_CODE,
          }).then(() => {
            cy.reload(true).contains('created')
          })
        })
      })
    }
  )
}

export function createOrganizationWithInvalidEmail(
  organization,
  { costCenterName, costCenterAddress },
  email
) {
  it(`Creating ${organization} with invalid email`, () => {
    const { name, b2bCustomerAdmin, defaultCostCenter } =
      getOrganisationPayload(
        organization,
        {
          costCenterName,
          costCenterAddress,
        },
        email
      )
    const invalidEmail = 'dev+test.com'
    verifyOrganizationData(
      name,
      b2bCustomerAdmin,
      defaultCostCenter,
      invalidEmail
    )
    cy.get(selectors.SubmitOrganization)
      .should('be.visible')
      .should('be.disabled')
  })
}
export function createOrganizationWithoutCostCenterNameAndAddress(
  organization,
  { costCenterName, costCenterAddress },
  email
) {
  it(`Creating Organization without cost center name & address`, () => {
    const { name, b2bCustomerAdmin } = getOrganisationPayload(
      organization,
      {
        costCenterName,
        costCenterAddress,
      },
      email
    )
    verifyOrganizationData(name, b2bCustomerAdmin, null, null)
    cy.get(selectors.SubmitOrganization)
      .should('be.visible')
      .should('be.disabled')
  })
}
export function createOrganizationWithoutName(
  organization,
  { costCenterName, costCenterAddress },
  email
) {
  it(`Creating Organization without name`, () => {
    const { b2bCustomerAdmin, defaultCostCenter } = getOrganisationPayload(
      organization,
      { costCenterName, costCenterAddress },
      email
    )
    verifyOrganizationData(null, b2bCustomerAdmin, defaultCostCenter, null)
    cy.get(selectors.SubmitOrganization)
      .should('be.visible')
      .should('be.disabled')
  })
}

export function organizationAdminShouldNotAbleToEditSalesUsers() {
  it(
    `Organization should not be able to edit Sales Users`,
    { retries: 1 },
    () => {
      cy.gotoMyOrganization()
      cy.get(selectors.AddUser).should('be.visible')
      for (let role of OTHER_ROLES)
        cy.contains(role).should('have.class', 'c-disabled')
    }
  )
}
