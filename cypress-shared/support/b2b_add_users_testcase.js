import selectors from './cypress-template/common_selectors.js'
import {
  generateEmailId,
  generateName,
  ROLE_ID_EMAIL_MAPPING,
} from './b2b_utils.js'
import b2b from './b2b_constants.js'
import { GRAPHL_OPERATIONS } from './graphql_utils.js'
import { BUTTON_LABEL, TOAST_MSG } from './validation_text.js'

export function addUserFn({ userName, emailId }, costCenter, dropDownText) {
  cy.gotoMyOrganization()
  cy.get(selectors.AddUser).should('be.visible')
  cy.get('body').then(($body) => {
    //TODO: Based on Arthur decision, decide whether to include below if or not
    // if user can add same user with different / same role again and again then below if not needed
    // else ensure that we get update error popup
    if ($body.text().includes(emailId)) {
      cy.log('User already added')
    } else {
      cy.get(selectors.AddUser).click()
      cy.get(selectors.UserName).type(userName).should('have.value', userName)
      cy.get(selectors.UserEmail).type(emailId).should('have.value', emailId)
      cy.get(selectors.UserCostCenter)
        .select(costCenter)
        .find('option:selected')
        .should('have.text', costCenter)
      cy.get(selectors.UserRole)
        .select(dropDownText)
        .find('option:selected')
        .should('have.text', dropDownText)
      cy.waitForGraphql(GRAPHL_OPERATIONS.GetUsers, selectors.SubmitUser)
      // cy.get(selectors.ToastMsgInB2B).contains(TOAST_MSG.added)
    }
  })
}

export function addUser(organizationName, costCenter, role) {
  const { email, dropDownText } = role
  it(
    `Adding ${dropDownText} in ${organizationName} with ${costCenter}`,
    { retries: 3 },
    () => {
      const userName = generateName(email)
      const emailId = generateEmailId(organizationName, email)
      addUserFn({ userName, emailId }, costCenter, dropDownText)
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
    addUserFn({ userName, emailId }, currentCostCenter, previous)
    cy.contains(emailId).should('be.visible').click()
    cy.get(selectors.CostCenterDropDownInEdit, { timeout: 2000 }).select(
      updateCostCenter
    )
    cy.get(selectors.RoleDropDownInEdit).select(dropDownText)
    cy.get(selectors.UpdateUser).click()
    cy.get(selectors.ToastMsgInB2B).contains(TOAST_MSG.updated)
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
      addUserFn({ userName, emailId }, costCenter, previous)
      addUserFn({ userName, emailId }, costCenter, dropDownText)
    }
  )
}

export function addAnddeleteUser(organization, costCenter, role) {
  const { email, dropDownText } = role
  const userName = generateName(email)
  const emailId = generateEmailId(organization, email)

  it(`Add & Delete a user ${emailId}`, () => {
    addUserFn({ userName, emailId }, costCenter, dropDownText)
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
    // TODO: uncomment below line once they fix delete user
    // cy.get(selectors.ToastMsgInB2B).contains(TOAST_MSG.deleted)
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
  organization,
  costCenter,
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
      cy.get(selectors.ToastMsgInB2B).contains(TOAST_MSG.updated)
    }
  )
}

export function updateCostCenterOftheUser(
  organization,
  currentCostCenter,
  updatedCostCenter,
  role
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
      cy.get(selectors.ToastMsgInB2B).contains(TOAST_MSG.updated)
    }
  )
}

export function ReloadForCostCenter() {
  it('Reload', { retries: 3 }, () => {
    cy.getVtexItems().then((vtex) => {
      // cy.visit('/')
      cy.reload(true).get(selectors.ProfileLabel).should('be.visible')
      // cy.get(selectors.ProfileLabel).should('be.visible')
      // cy.waitForSession();
    })
  })
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
            costId:
              organizationItems[`${organizationName}-${costCenter1.name}`],
            name: generateName(role),
            email: generateEmailId(organizationName, email),
          }

          cy.request({
            method: 'POST',
            url: CUSTOM_URL,
            body: {
              query: GRAPHQL_ADD_USER_MUTATION,
              variables: variables,
            },
          }).then((resp) => {
            expect(resp.body.data.saveUser.status).to.equal('success')
          })
        })
      })
    }
  )
}
