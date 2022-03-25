import selectors from '../common/selectors.js'

export function generateName(role) {
  return `${role}-Robot`
}

export function getCostCenterName(organization, costCenter) {
  return `${organization}-${costCenter}`
}

export function generateEmailId(organization, role) {
  const [basename, domain] = Cypress.env().base.gmail.id.split('@')

  return `${basename}+${Cypress.env().workspace.name}${organization.slice(
    0,
    3
  )}${organization.slice(-1)}${role}@${domain}`
}

export const STATUSES = {
  ready: 'ready',
  placed: 'placed',
  declined: 'declined',
  expired: 'expired',
  pending: 'pending',
  revised: 'revised',
}

export const ROLE_DROP_DOWN = {
  OrganizationAdmin: 'Organization Admin',
  Buyer: 'Organization Buyer',
  Approver: 'Organization Approver',
}

export const ROLE_DROP_DOWN_EMAIL_MAPPING = {
  OrganizationAdmin1: {
    dropDownText: ROLE_DROP_DOWN.OrganizationAdmin,
    email: 'oa1',
  },
  OrganizationAdmin2: {
    dropDownText: ROLE_DROP_DOWN.OrganizationAdmin,
    email: 'oa2',
  },
  OrganizationAdmin3: {
    dropDownText: ROLE_DROP_DOWN.OrganizationAdmin,
    email: 'oa3',
  },
  Buyer1: { dropDownText: ROLE_DROP_DOWN.Buyer, email: 'b1' },
  Buyer2: { dropDownText: ROLE_DROP_DOWN.Buyer, email: 'b2' },
  Buyer3: { dropDownText: ROLE_DROP_DOWN.Buyer, email: 'b3' },
  Buyer4: {
    dropDownText: ROLE_DROP_DOWN.Buyer,
    email: 'b3',
  },
  Approver1: { dropDownText: ROLE_DROP_DOWN.Approver, email: 'a1' },
  Approver2: { dropDownText: ROLE_DROP_DOWN.Approver, email: 'a2' },
  Approver3: { dropDownText: ROLE_DROP_DOWN.Approver, email: 'a3' },
}

export const OTHER_ROLES = [
  'Sales Admin',
  'Sales Representative',
  'Sales Manager',
]

export const ROLE_ID_EMAIL_MAPPING = {
  SalesAdmin: { role: OTHER_ROLES[0], email: 'sa' },
  SalesRepresentative: { role: OTHER_ROLES[1], email: 'sr' },
  SalesManager: { role: OTHER_ROLES[2], email: 'sm' },
}

export const PAYMENT_TERMS = {
  Promissory: 'Promissory',
  NET30: 'NET 30',
}

export function validateToastMsg(msg) {
  cy.get(selectors.ToastMsgInB2B, { timeout: 5000 })
    .should('be.visible')
    .contains(msg)
}
