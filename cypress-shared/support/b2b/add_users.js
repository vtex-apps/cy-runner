import selectors from '../common/selectors.js'
import {
  generateEmailId,
  generateName,
  ROLE_ID_EMAIL_MAPPING,
  validateToastMsg,
} from './utils.js'
import b2b from './constants.js'
import { GRAPHL_OPERATIONS } from '../graphql_utils.js'
import { BUTTON_LABEL, TOAST_MSG } from '../validation_text.js'

export function addUserFn(
  { userName, emailId, costCenter, duplicateUser = false },
  dropDownText
) {
  cy.gotoMyOrganization()
  cy.get(selectors.AddUser).should('be.visible')
  cy.get('body').then(($body) => {
    if ($body.text().includes(emailId) && !duplicateUser) {
      cy.log('User already added')
    } else {
      cy.get(selectors.AddUser).click()
      cy.get(selectors.UserName)
        .clear()
        .type(userName)
        .should('have.value', userName)
      cy.get(selectors.UserEmail)
        .clear()
        .type(emailId)
        .should('have.value', emailId)
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

export function addUser({ organizationName, costCenter, role }) {
  const { email, dropDownText } = role

  it(
    `Adding ${dropDownText} in ${organizationName} with ${costCenter}`,
    { retries: 3 },
    () => {
      const userName = generateName(email)
      const emailId = generateEmailId(organizationName, email)

      addUserFn({ userName, emailId, costCenter }, dropDownText)
    }
  )
}

export function duplicateUserTestCase({
  organizationName,
  costCenter,
  role,
  sameOrganization = true,
  // If sameOrganization is false then user is from different organization
}) {
  const { email, dropDownText } = role
  const subTitle = sameOrganization ? 'same' : 'different'

  it(
    `Add duplicate user from ${subTitle} organization and verify popup`,
    { retries: 3 },
    () => {
      const userName = generateName(email)
      const emailId = generateEmailId(organizationName, email)

      addUserFn(
        { userName, emailId, costCenter, duplicateUser: true },
        dropDownText
      )
      validateToastMsg(
        sameOrganization
          ? TOAST_MSG.userAlreadyRegisteredInThisOrganization
          : TOAST_MSG.userAlreadyRegisteredInAnotherOrganization
      )
    }
  )
}

export function addAndupdateUser(
  organization,
  { currentCostCenter, updateCostCenter },
  { currentRole, updatedRole }
) {
  const { email, dropDownText } = updatedRole
  const userName = generateName(email)
  const emailId = generateEmailId(organization, email)

  it(`Adding ${emailId} & update its role & Costcenter`, { retries: 3 }, () => {
    const { dropDownText: previous } = currentRole

    addUserFn({ userName, emailId, costCenter: currentCostCenter }, previous)
    cy.contains(emailId).should('be.visible').click()
    cy.get(selectors.CostCenterDropDownInEdit, { timeout: 2000 }).select(
      updateCostCenter
    )
    cy.get(selectors.RoleDropDownInEdit).select(dropDownText)
    cy.get(selectors.UpdateUser).click()
    validateToastMsg(TOAST_MSG.updated)
  })
}

export function addSameUserAgainInOrganization(
  organization,
  costCenter,
  { currentRole, updatedRole }
) {
  const { email, dropDownText } = updatedRole
  const userName = generateName(email)
  const emailId = generateEmailId(organization, email)
  const { dropDownText: previous } = currentRole

  it.skip(
    `Adding ${emailId} with role ${previous} & update the role to ${dropDownText}`,
    { retries: 3 },
    () => {
      addUserFn({ userName, emailId, costCenter }, previous)
      addUserFn({ userName, emailId, costCenter }, dropDownText)
    }
  )
}

export function addAnddeleteUser(organization, costCenter, role) {
  const { email, dropDownText } = role
  const userName = generateName(email)
  const emailId = generateEmailId(organization, email)

  it(`Add & Delete a user ${emailId}`, () => {
    addUserFn({ userName, emailId, costCenter }, dropDownText)
    cy.contains(emailId).click()
    cy.get(`input[value='${emailId}']`).should('be.disabled')
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

export function updateRoleOfTheUser(
  { organization, costCenter },
  currentRole,
  updatedRole
) {
  it(
    `Updating the user from this role ${currentRole.dropDownText} to this role ${updatedRole.dropDownText} in ${organization} with ${costCenter}`,
    { retries: 3 },
    () => {
      const { email } = currentRole
      const { dropDownText } = updatedRole

      cy.gotoMyOrganization()
      cy.get(selectors.AddUser).should('be.visible')
      cy.contains(generateEmailId(organization, email))
        .should('be.visible')
        .click()
      cy.get(selectors.CostCenterDropDownInEdit).select(costCenter)
      cy.get(selectors.RoleDropDownInEdit).select(dropDownText)
      cy.get(selectors.UpdateUser).click()
      validateToastMsg(TOAST_MSG.updated)
    }
  )
}

export function updateCostCenterOftheUser(
  { organization, role },
  currentCostCenter,
  updatedCostCenter
) {
  it(
    `Updating the user from this costcenter ${currentCostCenter} to this costcenter ${updatedCostCenter} in ${organization}`,
    { retries: 3 },
    () => {
      const { email } = role

      cy.gotoMyOrganization()
      cy.get(selectors.AddUser).should('be.visible')
      cy.contains(generateEmailId(organization, email))
        .should('be.visible')
        .click()
      cy.get(selectors.CostCenterDropDownInEdit).select(updatedCostCenter)
      cy.get(selectors.UpdateUser).click()
      validateToastMsg(TOAST_MSG.updated)
    }
  )
}

export function addUserViaGraphql(roleKey) {
  const { organizationName, costCenter1 } = b2b.OrganizationA

  it(
    `Adding ${roleKey} in ${organizationName} with ${costCenter1.name}`,
    { retries: 3 },
    () => {
      const { email, role } = ROLE_ID_EMAIL_MAPPING[roleKey]
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
            email: generateEmailId(organizationName, email),
          }

          expect(variables.roleId).to.not.be.undefined
          expect(variables.orgId).to.not.be.undefined
          expect(variables.costId).to.not.be.undefined

          cy.request({
            method: 'POST',
            url: CUSTOM_URL,
            body: {
              query: GRAPHQL_ADD_USER_MUTATION,
              variables,
            },
          }).then((resp) => {
            expect(resp.body.data.saveUser.status).to.equal('success')
          })
        })
      })
    }
  )
}
