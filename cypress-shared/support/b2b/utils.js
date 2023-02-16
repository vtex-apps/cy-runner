import selectors from '../common/selectors.js'

export function generateName(role) {
  return `${role}-Robot`
}

export function generateEmailWithSuffix(email, organization, role) {
  const [basename, domain] = email.split('@')
  const emailWithPrefix = `${basename}+${
    Cypress.env().workspace.name
  }${organization.slice(0, 3)}${organization
    .split('-')[0]
    .slice(-1)}${role}a@${domain}`

  return emailWithPrefix.toLowerCase()
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
    suffixInEmail: 'oa1',
  },
  OrganizationAdmin2: {
    dropDownText: ROLE_DROP_DOWN.OrganizationAdmin,
    suffixInEmail: 'oa2',
  },
  OrganizationAdmin3: {
    dropDownText: ROLE_DROP_DOWN.OrganizationAdmin,
    suffixInEmail: 'oa3',
  },
  Buyer1: { dropDownText: ROLE_DROP_DOWN.Buyer, suffixInEmail: 'b1' },
  Buyer2: { dropDownText: ROLE_DROP_DOWN.Buyer, suffixInEmail: 'b2' },
  Buyer3: { dropDownText: ROLE_DROP_DOWN.Buyer, suffixInEmail: 'b3' },
  Buyer4: {
    dropDownText: ROLE_DROP_DOWN.Buyer,
    suffixInEmail: 'b3',
  },
  Approver1: { dropDownText: ROLE_DROP_DOWN.Approver, suffixInEmail: 'a1' },
  Approver2: { dropDownText: ROLE_DROP_DOWN.Approver, suffixInEmail: 'a2' },
  Approver3: { dropDownText: ROLE_DROP_DOWN.Approver, suffixInEmail: 'a3' },
}

export const OTHER_ROLES = [
  'Sales Admin',
  'Sales Representative',
  'Sales Manager',
]

export const ROLE_ID_EMAIL_MAPPING = {
  SalesAdmin: { role: OTHER_ROLES[0], suffixInEmail: 'sa' },
  SalesRepresentative: { role: OTHER_ROLES[1], suffixInEmail: 'sr' },
  SalesManager: { role: OTHER_ROLES[2], suffixInEmail: 'sm' },
}

export const PAYMENT_TERMS = {
  Promissory: 'Promissory',
  NET30: 'NET 30',
}

export function validateToastMsg(msg) {
  cy.get(selectors.ToastMsgInB2B, { timeout: 8000 })
    .should('be.visible')
    .contains(msg)
}

export function validateToolTipMsg(message, position = 0) {
  cy.qe(
    `Validating the tooltip message - ${message} and its position - ${position}`
  )
  cy.get('span[class*=danger]', { timeout: 15000 })
    .should('be.visible')
    .eq(position)
    .trigger('mouseover')
  cy.get('div[role=tooltip]', { timeout: 5000 })
    .should('be.visible')
    .eq(position)
    .contains(message)
}
