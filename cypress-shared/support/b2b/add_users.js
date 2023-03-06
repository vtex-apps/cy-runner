import selectors from '../common/selectors.js'
import { updateRetry } from '../common/support.js'
import {
  generateEmailWithSuffix,
  generateName,
  ROLE_ID_EMAIL_MAPPING,
  validateToastMsg,
} from './utils.js'
import b2b from './constants.js'
import { GRAPHL_OPERATIONS } from '../graphql_operations.js'
import { BUTTON_LABEL, TOAST_MSG } from '../validation_text.js'

export function addUserFn(
  { userName, email, costCenter, duplicateUser = false },
  dropDownText
) {
  cy.gotoMyOrganization()
  cy.get(selectors.AddUser).should('be.visible')
  cy.get('body').then(($body) => {
    if ($body.text().includes(email) && !duplicateUser) {
      cy.log('User already added')
    } else {
      cy.get(selectors.AddUser).click()
      cy.get(selectors.UserName)
        .clear()
        .type(userName)
        .should('have.value', userName)
      cy.get(selectors.UserEmail)
        .clear()
        .type(email)
        .should('have.value', email)
      cy.get(selectors.UserCostCenter)
        .select(costCenter)
        .find('option:selected')
        .should('have.text', costCenter)
      cy.get(selectors.UserRole)
        .select(dropDownText)
        .find('option:selected')
        .should('have.text', dropDownText)
      cy.waitForGraphql(GRAPHL_OPERATIONS.GetUsers, selectors.SubmitUser)
      // validateToastMsg(TOAST_MSG.added)
    }
  })
}

export function addUser({ organizationName, costCenter, role, gmailCreds }) {
  const { suffixInEmail, dropDownText } = role

  it(
    `Adding ${dropDownText} in ${organizationName} with ${costCenter}`,
    updateRetry(3),
    () => {
      const userName = generateName(suffixInEmail)
      const email = generateEmailWithSuffix(
        gmailCreds.email,
        organizationName,
        suffixInEmail
      )

      addUserFn({ userName, email, costCenter }, dropDownText)
    }
  )
}

export function duplicateUserTestCase({
  organizationName,
  costCenter,
  role,
  gmailCreds,
}) {
  const { suffixInEmail, dropDownText } = role
  const email = generateEmailWithSuffix(
    gmailCreds.email,
    organizationName,
    suffixInEmail
  )

  it(
    `Add duplicate user ${email} from same organization and verify popup`,
    updateRetry(3),
    () => {
      const userName = generateName(suffixInEmail)

      addUserFn(
        { userName, email, costCenter, duplicateUser: true },
        dropDownText
      )
      validateToastMsg(TOAST_MSG.userAlreadyRegisteredInThisOrganization)
    }
  )
}

export function addAndupdateUser({
  organization,
  currentCostCenter,
  updateCostCenter,
  currentRole,
  updatedRole,
  gmailCreds,
}) {
  const { suffixInEmail, dropDownText } = updatedRole
  const userName = generateName(suffixInEmail)
  const email = generateEmailWithSuffix(
    gmailCreds.email,
    organization,
    suffixInEmail
  )

  it(`Adding ${email} & update its role & Costcenter`, updateRetry(3), () => {
    const { dropDownText: previous } = currentRole

    addUserFn({ userName, email, costCenter: currentCostCenter }, previous)
    cy.contains(email).should('be.visible').click()
    cy.get(selectors.CostCenterDropDownInEdit, { timeout: 2000 }).select(
      updateCostCenter
    )
    cy.get(selectors.RoleDropDownInEdit).select(dropDownText)
    cy.get(selectors.UpdateUser).click()
    validateToastMsg(TOAST_MSG.updated)
  })
}

export function addSameUserAgainInOrganization({
  organization,
  costCenter,
  currentRole,
  updatedRole,
  gmailCreds,
}) {
  const { suffixInEmail, dropDownText } = updatedRole
  const userName = generateName(suffixInEmail)
  const email = generateEmailWithSuffix(
    gmailCreds.email,
    organization,
    suffixInEmail
  )

  const { dropDownText: previous } = currentRole

  it.skip(
    `Adding ${email} with role ${previous} & update the role to ${dropDownText}`,
    updateRetry(3),
    () => {
      addUserFn({ userName, email, costCenter }, previous)
      addUserFn({ userName, email, costCenter }, dropDownText)
    }
  )
}

export function addAnddeleteUser({
  organization,
  costCenter,
  role,
  gmailCreds,
}) {
  const { suffixInEmail, dropDownText } = role
  const userName = generateName(suffixInEmail)
  const email = generateEmailWithSuffix(gmailCreds, organization, suffixInEmail)

  it(`Add & Delete a user ${email}`, () => {
    addUserFn({ userName, email, costCenter }, dropDownText)
    cy.contains(email).click()
    cy.get(`input[value='${email}']`).should('be.disabled')
    cy.get(selectors.Remove)
      .contains(BUTTON_LABEL.remove)
      .should('be.visible')
      .click()
    cy.get(selectors.ModalConfirmation).should('be.visible')
    cy.get(selectors.ModalConfirmation)
      .contains(BUTTON_LABEL.remove)
      .last()
      .should('be.visible')
      .click()
    cy.get('body').then(($body) => {
      if ($body.find(selectors.ModalClose).length) {
        cy.get(selectors.ModalConfirmation)
          .contains(BUTTON_LABEL.cancel)
          .click()
      }
    })
  })
}

export function updateRoleOfTheUser({
  organization,
  costCenter,
  currentRole,
  updatedRole,
  gmailCreds,
}) {
  it(
    `Updating the user from this role ${currentRole.dropDownText} to this role ${updatedRole.dropDownText} in ${organization} with ${costCenter}`,
    updateRetry(3),
    () => {
      const { suffixInEmail } = currentRole
      const { dropDownText } = updatedRole

      cy.gotoMyOrganization()
      cy.get(selectors.AddUser).should('be.visible')
      cy.contains(
        generateEmailWithSuffix(gmailCreds.email, organization, suffixInEmail)
      )
        .should('be.visible')
        .click()
      cy.get(selectors.CostCenterDropDownInEdit).select(costCenter)
      cy.get(selectors.RoleDropDownInEdit).select(dropDownText)
      cy.get(selectors.UpdateUser).click()
      validateToastMsg(TOAST_MSG.updated)
    }
  )
}

export function updateCostCenterOftheUser({
  organization,
  role,
  currentCostCenter,
  updatedCostCenter,
  gmailCreds,
}) {
  it(
    `Updating the user from this costcenter ${currentCostCenter} to this costcenter ${updatedCostCenter} in ${organization}`,
    updateRetry(3),
    () => {
      const { suffixInEmail } = role

      cy.gotoMyOrganization()
      cy.get(selectors.AddUser).should('be.visible')
      cy.contains(
        generateEmailWithSuffix(gmailCreds.email, organization, suffixInEmail)
      )
        .should('be.visible')
        .click()
      cy.get(selectors.CostCenterDropDownInEdit).select(updatedCostCenter)
      cy.get(selectors.UpdateUser).click()
      validateToastMsg(TOAST_MSG.updated)
    }
  )
}

export function addUserViaGraphql(gmailCreds, roleKey) {
  const { organizationName, costCenter1 } = b2b.OrganizationA

  it(
    `Adding ${roleKey} in ${organizationName} with ${costCenter1.name}`,
    updateRetry(3),
    () => {
      const { suffixInEmail, role } = ROLE_ID_EMAIL_MAPPING[roleKey]
      // Define constants
      const APP_NAME = 'vtex.storefront-permissions'
      const APP_VERSION = '1.x'
      const APP = `${APP_NAME}@${APP_VERSION}`

      cy.getVtexItems().then((vtex) => {
        cy.getOrganizationItems().then((organizationItems) => {
          const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`
          const GRAPHQL_ADD_USER_MUTATION =
            'mutation' +
            '($roleId: ID!,$orgId: ID,$costId: ID,$name: String!,$email:String!)' +
            '{saveUser(roleId:$roleId,orgId:$orgId,costId:$costId,name:$name,email:$email){' +
            'id,status}}'

          const variables = {
            roleId: organizationItems[`${role}-id`],
            orgId: organizationItems[organizationName],
            costId: organizationItems[costCenter1.name],
            name: generateName(role),
            email: generateEmailWithSuffix(
              gmailCreds.email,
              organizationName,
              suffixInEmail
            ),
          }

          expect(variables.roleId).to.not.be.undefined
          expect(variables.orgId).to.not.be.undefined
          expect(variables.costId).to.not.be.undefined

          cy.callGraphqlAndAddLogs({
            url: CUSTOM_URL,
            query: GRAPHQL_ADD_USER_MUTATION,
            variables,
          }).then((resp) => {
            expect(resp.body.data.saveUser.status).to.equal('success')
          })
        })
      })
    }
  )
}
