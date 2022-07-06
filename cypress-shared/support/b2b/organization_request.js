import selectors from '../common/selectors.js'
import { OTHER_ROLES } from './utils.js'
import { GRAPHL_OPERATIONS } from '../graphql_utils.js'
import { BUTTON_LABEL } from '../validation_text.js'
import { FAIL_ON_STATUS_CODE } from '../common/constants.js'
import { OrganizationRequestStatus } from './constants.js'
import { updateRetry } from '../common/support.js'

// Define constants
const APP_NAME = 'vtex.b2b-organizations-graphql'
const APP_VERSION = '0.x'
const APP = `${APP_NAME}@${APP_VERSION}`

function getOrganisationPayload(
  { name, tradeName },
  { costCenterName, costCenterAddress, phoneNumber, businessDocument },
  email
) {
  return {
    name,
    tradeName,
    b2bCustomerAdmin: {
      firstName: 'Robot',
      lastName: email,
      email,
    },
    defaultCostCenter: {
      name: costCenterName,
      phoneNumber,
      businessDocument,
      ...costCenterAddress,
    },
  }
}

function fillAndVerifyData(selector, text) {
  text
    ? cy.get(selector).last().clear().type(text).should('have.value', text)
    : cy.get(selector).last().clear()
}

function fillOrganizationRequest(
  { name, tradeName, b2bCustomerAdmin },
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

    cy.get('body').then(($body) => {
      if ($body.find(selectors.PopupMsg).length) {
        cy.get('button > div')
          .contains(BUTTON_LABEL.create)
          .should('be.visible')
          .click()
      }
    })

    const { firstName, lastName } = b2bCustomerAdmin
    const email = invalidEmail || b2bCustomerAdmin.email

    cy.get(selectors.OrganisationSignup, { timeout: 25000 })
      .should('be.visible')
      .click()
    cy.get(selectors.PageNotFound, { timeout: 10000 }).should('not.exist')

    // Organization Name & TradeName Section
    fillAndVerifyData(selectors.OrganizationName, name)
    fillAndVerifyData(selectors.TradeName, tradeName)

    // User to become Organization Admin Section
    fillAndVerifyData(selectors.FirstNameinB2B, firstName)
    fillAndVerifyData(selectors.LastNameinB2B, lastName)
    fillAndVerifyData(selectors.EmailinB2B, email)

    // Default cost center Section
    if (defaultCostCenter) {
      fillAndVerifyData(selectors.CostCenter, defaultCostCenter.name)
      fillAndVerifyData(selectors.PhoneNumber, defaultCostCenter.phoneNumber)
      fillAndVerifyData(
        selectors.BusinessDocument,
        defaultCostCenter.businessDocument
      )
      cy.fillAddressInCostCenter(defaultCostCenter)
    } else {
      cy.log('Filling costCenter is disabled')
    }
  })
}

function submitOrganization(org) {
  cy.waitForGraphql(
    GRAPHL_OPERATIONS.CreateOrganizationRequest,
    selectors.SubmitOrganization
  ).then((req) => {
    cy.get(selectors.PopupMsg).contains('pending approval')
    const { id } = req.response.body.data.createOrganizationRequest

    cy.setOrganizationItem(org, id)
  })
}

export function createOrganizationTestCase(
  organization,
  {
    costCenterName,
    costCenterAddress,
    phoneNumber,
    businessDocument,
    approved = false,
    declined = false,
  }
) {
  it(
    `Creating ${organization.name} via storefront & Approving ${organization.name} via graphql`,
    { retries: 2 },
    () => {
      cy.getVtexItems().then((vtex) => {
        const { name, tradeName, b2bCustomerAdmin, defaultCostCenter } =
          getOrganisationPayload(
            organization,
            {
              costCenterName,
              costCenterAddress,
              phoneNumber,
              businessDocument,
            },
            organization.email
          )

        fillOrganizationRequest(
          { name, b2bCustomerAdmin, tradeName },
          defaultCostCenter
        )
        submitOrganization(organization.name)
        if (approved) {
          updateOrganizationRequestStatus(
            { vtex },
            organization.name,
            OrganizationRequestStatus.approved
          )
        } else if (declined) {
          updateOrganizationRequestStatus(
            { vtex },
            organization.name,
            OrganizationRequestStatus.declined
          )
        }
      })
    }
  )
}

export function approveOrganization(organization) {
  it(`Approving ${organization} request`, () => {
    cy.getVtexItems().then((vtex) => {
      updateOrganizationRequestStatus(
        { vtex, verify: false },
        organization,
        OrganizationRequestStatus.approved
      )
    })
  })
}

function updateOrganizationRequestStatus({ vtex, verify = true }, org, status) {
  cy.getOrganizationItems().then((items) => {
    const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`

    const GRAPHQL_ORAGANIZATION_UPDATE_MUTATION =
      'mutation' +
      '($id: ID!,$status: String!)' +
      '{updateOrganizationRequest(id: $id,status:$status){id,status}}'

    const variables = {
      id: items[org],
      status,
    }

    cy.request({
      method: 'POST',
      url: CUSTOM_URL,
      body: {
        query: GRAPHQL_ORAGANIZATION_UPDATE_MUTATION,
        variables,
      },
      ...FAIL_ON_STATUS_CODE,
    }).then(() => {
      if (verify) {
        const statusInUI =
          status === OrganizationRequestStatus.approved ? 'created' : 'declined'

        cy.reload(true).contains(statusInUI)
      }
    })
  })
}

export function requestOrganizationAndVerifyPopup(
  organization,
  { costCenterName, costCenterAddress },
  status
) {
  const msg =
    status === OrganizationRequestStatus.approved
      ? 'approved request'
      : 'pending request'

  it(
    `Creating ${organization.name} via storefront and verify we are getting this message ${msg} in popup`,
    updateRetry(2),
    () => {
      const { name, tradeName, b2bCustomerAdmin, defaultCostCenter } =
        getOrganisationPayload(
          organization,
          {
            costCenterName,
            costCenterAddress,
          },
          organization.email
        )

      fillOrganizationRequest(
        { name, b2bCustomerAdmin, tradeName },
        defaultCostCenter,
        organization.email
      )
      // cy.get(selectors.SubmitOrganization).click()

      cy.waitForGraphql(
        GRAPHL_OPERATIONS.CreateOrganizationRequest,
        selectors.SubmitOrganization
      ).then(() => {
        cy.contains(msg)
      })
    }
  )
}

export function createOrganizationRequestTestCase(
  organization,
  { costCenterName, costCenterAddress },
  email
) {
  it(`Creating ${organization.name} via storefront`, () => {
    const { name, b2bCustomerAdmin, defaultCostCenter, tradeName } =
      getOrganisationPayload(
        organization,
        {
          costCenterName,
          costCenterAddress,
        },
        email
      )

    fillOrganizationRequest(
      { name, b2bCustomerAdmin, tradeName },
      defaultCostCenter,
      organization.email
    )
    cy.get(selectors.SubmitOrganization).click()
  })
}

export function createOrganizationWithInvalidEmail(
  organization,
  { costCenterName, costCenterAddress },
  email
) {
  it(`Creating ${organization} with invalid email`, () => {
    const { name, tradeName, b2bCustomerAdmin, defaultCostCenter } =
      getOrganisationPayload(
        organization,
        {
          costCenterName,
          costCenterAddress,
        },
        email
      )

    const invalidEmail = 'dev+test.com'

    fillOrganizationRequest(
      { name, b2bCustomerAdmin, tradeName },
      defaultCostCenter,
      invalidEmail
    )
    cy.get(selectors.SubmitOrganization)
      .should('be.visible')
      .should('be.disabled')
  })
}

export function createOrganizationWithInvalidPhoneNumber(
  organization,
  { costCenterName, costCenterAddress, phoneNumber },
  email
) {
  it(`Creating Organization with Invalid phone number`, () => {
    const { name, defaultCostCenter, b2bCustomerAdmin, tradeName } =
      getOrganisationPayload(
        organization,
        {
          costCenterName,
          costCenterAddress,
          phoneNumber,
        },
        email
      )

    fillOrganizationRequest(
      { name, b2bCustomerAdmin, tradeName },
      defaultCostCenter
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
    const { name, tradeName, b2bCustomerAdmin } = getOrganisationPayload(
      organization,
      {
        costCenterName,
        costCenterAddress,
      },
      email
    )

    fillOrganizationRequest({ name, b2bCustomerAdmin, tradeName }, null, null)

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
    const { b2bCustomerAdmin, defaultCostCenter, tradeName } =
      getOrganisationPayload(
        organization,
        { costCenterName, costCenterAddress },
        email
      )

    fillOrganizationRequest(
      { name: null, b2bCustomerAdmin, tradeName },
      defaultCostCenter,
      null
    )
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
      for (const role of OTHER_ROLES) {
        cy.contains(role).should('have.class', 'c-disabled')
      }
    }
  )
}
