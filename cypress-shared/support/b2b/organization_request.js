import selectors from '../common/selectors.js'
import { OTHER_ROLES } from './utils.js'
import { GRAPHL_OPERATIONS } from '../graphql_operations.js'
import { BUTTON_LABEL } from '../validation_text.js'
import { OrganizationRequestStatus } from './constants.js'
import { updateRetry } from '../common/support.js'

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
  { name, b2bCustomerAdmin },
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

    cy.qe('From Top Right Navbar - Click Organization Signup link')
    cy.get(selectors.OrganisationSignup, { timeout: 25000 })
      .should('be.visible')
      .click()
    cy.qe(
      'Verify on click to organization signup link not redirects us to 404 page'
    )
    cy.get(selectors.PageNotFound, { timeout: 10000 }).should('not.exist')

    if (name) {
      cy.qe(`For OrganizationName field, type ${name}`)
      cy.get(selectors.OrganizationName)
        .clear()
        .type(name)
        .should('have.value', name)
    } else {
      cy.qe('Clear OrganizationName field')
      cy.get(selectors.OrganizationName).clear()
    }

    cy.qe(`For firstName field, Type ${firstName}`)
    cy.get(selectors.FirstNameinB2B)
      .clear()
      .type(firstName)
      .should('have.value', firstName)
    cy.qe(`For lastname field, Type ${lastName}`)
    cy.get(selectors.LastNameinB2B)
      .clear()
      .type(lastName)
      .should('have.value', lastName)
    cy.qe(`For email field, clear and type ${email}`)
    cy.get(selectors.EmailinB2B).clear().type(email).should('have.value', email)
    if (defaultCostCenter) {
      cy.qe(`For costcenter field, clear and type ${defaultCostCenter.name}`)
      cy.get(selectors.CostCenter)
        .clear()
        .type(defaultCostCenter.name)
        .should('have.value', defaultCostCenter.name)
      cy.fillAddressInCostCenter(defaultCostCenter)
    } else {
      cy.log(`Skip! defaultCostCenter - It is ${defaultCostCenter}`)
    }
  })
}

function submitOrganization(org) {
  cy.qe(
    `Click Submit btn and wait for this graphql ${GRAPHL_OPERATIONS.CreateOrganizationRequest} to be called`
  )
  cy.waitForGraphql(
    GRAPHL_OPERATIONS.CreateOrganizationRequest,
    selectors.SubmitOrganization
  ).then((req) => {
    cy.qe('Verify popup is shown with text pending approval')
    cy.get(selectors.PopupMsg).should('be.visible').contains('pending approval')
    const { id } = req.response.body.data.createOrganizationRequest

    cy.qe(
      `Get organizationRequest id from this graphql ${GRAPHL_OPERATIONS.CreateOrganizationRequest} and store in .organizations.json`
    )
    cy.setOrganizationItem(org, id)
  })
}

function generateSubTitle(approved, declined) {
  let subTitle = 'organization is in pending state'

  if (approved) {
    subTitle = `we are able to Approve via graphql`
  } else if (declined) {
    subTitle = `we are able to Decline via graphql`
  }

  return subTitle
}

export function createOrganizationTestCase(
  organization,
  { costCenterName, costCenterAddress, approved = false, declined = false }
) {
  const msg = generateSubTitle(approved, declined)

  it(
    `Creating ${organization.name} via storefront & verify ${msg}`,
    updateRetry(1),
    () => {
      cy.qe(`Creating ${organization.name} via storefront & verify ${msg}`)
      cy.getVtexItems().then((vtex) => {
        const { name, b2bCustomerAdmin, defaultCostCenter } =
          getOrganisationPayload(
            organization.name,
            {
              costCenterName,
              costCenterAddress,
            },
            organization.email
          )

        verifyOrganizationData({ name, b2bCustomerAdmin }, defaultCostCenter)
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
  it(`Approving ${organization} request`, updateRetry(1), () => {
    cy.qe(`Approving ${organization} request`)
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

    cy.callGraphqlAndAddLogs({
      url: CUSTOM_URL,
      query: GRAPHQL_ORAGANIZATION_UPDATE_MUTATION,
      variables,
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
    updateRetry(1),
    () => {
      const { name, b2bCustomerAdmin, defaultCostCenter } =
        getOrganisationPayload(
          organization.name,
          {
            costCenterName,
            costCenterAddress,
          },
          organization.email
        )

      verifyOrganizationData(
        { name, b2bCustomerAdmin },
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
  it(`Creating ${organization.name} via storefront`, updateRetry(1), () => {
    const { name, b2bCustomerAdmin, defaultCostCenter } =
      getOrganisationPayload(
        organization,
        {
          costCenterName,
          costCenterAddress,
        },
        email
      )

    verifyOrganizationData(
      { name, b2bCustomerAdmin },
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
  it(`Creating ${organization} with invalid email`, updateRetry(1), () => {
    cy.qe(`Creating ${organization} with invalid email`)
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
      { name, b2bCustomerAdmin },
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
  it(
    `Creating Organization without cost center name & address`,
    updateRetry(1),
    () => {
      cy.qe(`Creating Organization without cost center name & address`)
      const { name, b2bCustomerAdmin } = getOrganisationPayload(
        organization,
        {
          costCenterName,
          costCenterAddress,
        },
        email
      )

      verifyOrganizationData({ name, b2bCustomerAdmin }, null, null)

      cy.get(selectors.SubmitOrganization)
        .should('be.visible')
        .should('be.disabled')
    }
  )
}

export function createOrganizationWithoutName(
  organization,
  { costCenterName, costCenterAddress },
  email
) {
  it(`Creating Organization without name`, updateRetry(1), () => {
    cy.qe(`Creating Organization without name`)
    const { b2bCustomerAdmin, defaultCostCenter } = getOrganisationPayload(
      organization,
      { costCenterName, costCenterAddress },
      email
    )

    verifyOrganizationData(
      { name: null, b2bCustomerAdmin },
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
    `Organization admin should not be able to edit Sales Users`,
    updateRetry(2),
    () => {
      cy.gotoMyOrganization()
      cy.get(selectors.AddUser).should('be.visible')
      for (const role of OTHER_ROLES) {
        cy.contains(role).should('have.class', 'c-disabled')
      }
    }
  )
}
