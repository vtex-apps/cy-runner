import { PRODUCTS } from '../common/utils.js'
import {
  ROLE_DROP_DOWN_EMAIL_MAPPING,
  ROLE_ID_EMAIL_MAPPING,
  generateEmailWithSuffix,
} from './utils.js'

const ORGANIZATION_A = `OrganizationA-${Cypress.env().workspace.name}`
const ORGANIZATION_B = `OrganizationB-${Cypress.env().workspace.name}`

export const OrganizationRequestStatus = {
  approved: 'approved',
  declined: 'declined',
  pending: 'pending',
}

export const USA_ADDRESS_1 = {
  postalCode: '33301',
  country: 'USA',
  street: 'Amy Sonnenblick MD Pl, 12 NE 12th Ave',
  receiverName: 'Robot',
}

export const USA_ADDRESS_2 = {
  postalCode: '90290',
  country: 'USA',
  street: 'Kerry Lane',
  receiverName: 'Robot',
}

export const USA_ADDRESS_3 = {
  postalCode: '30342',
  country: 'USA',
  street: '2851 Stroop Hill Road',
  receiverName: 'Robot',
}

export const USA_ADDRESS_4 = {
  postalCode: '33180',
  country: 'USA',
  street: '19501 Biscayne Blvd',
  receiverName: 'Robot',
}

export const FRANCE_ADDRESS = {
  postalCode: '93200',
  country: 'FRA',
  street: '91 Rue de Strasbourg',
  receiverName: 'Robot',
}

function quotesListForOrganizationA() {
  const Buyer = {
    quotes1: `${ORGANIZATION_A}-b1q1`, //
    quotes2: `${ORGANIZATION_A}-b1q2`, // add notes by sales admin
    quotes3: `${ORGANIZATION_A}-b1q3`, // declined by sales admin
    quotes4: `${ORGANIZATION_A}-b1q4`, // declined by approver
    quotes5: `${ORGANIZATION_A}-b1q5`, // declined by organization admin
    quotes6: `${ORGANIZATION_A}-b1q6`, // created from quickorder - Sales Admin change price to $30
    //  and update quantity 10
    quotes7: `${ORGANIZATION_A}-b1q6`, // quote with quantity 50
  }

  const Buyer2 = {
    quotes1: `${ORGANIZATION_A}-b2q1`, // created from quickorder - by categories
    quotes2: `${ORGANIZATION_A}-b2q2`, // created from quickorder - by categories with quantity 50
    quotes3: `${ORGANIZATION_A}-b2q3`, // create quote with discounted product. so that further discount is not possibled
  }

  const OrganizationAdmin2 = {
    quotes1: `${ORGANIZATION_A}-oa2q1`, // created from quickorder - sku,quantity
    declineQuote: Buyer.quotes5,
  }

  const Approver = {
    quotes1: `${ORGANIZATION_A}-a1q1`,
    quotes2: `${ORGANIZATION_A}-a1q2`,
    declineQuote: Buyer.quotes3,
  }

  const Approver2 = {
    updateQuote: Buyer2.quotes1,
    declineQuote: Buyer.quotes3,
  }

  const SalesRep = {
    updateQuote: Approver.quotes1,
    declineQuote: Buyer.quotes4,
  }

  const OrganizationAdmin = {
    quotes1: `${ORGANIZATION_A}-oa1q1`,
  }

  return {
    OrganizationAdmin,
    OrganizationAdmin2,
    Buyer,
    Buyer2,
    Approver,
    Approver2,
    SalesRep,
  }
}

function quotesListForOrganizationB() {
  const Buyer = {
    quotes1: `${ORGANIZATION_B}-b1q1`,
  }

  const OrganizationAdmin = {
    quotes1: `${ORGANIZATION_B}-oa1q1`,
  }

  return {
    OrganizationAdmin,
    Buyer,
  }
}

function generateCostCenterName(organizationName, costCenterName) {
  return `${organizationName}-${costCenterName}`
}

const { gmail } = Cypress.env().base

const ORG_A_GMAIL_CREDS = {
  email: gmail.emailId1,
  clientId: gmail.clientId1,
  clientSecret: gmail.clientSecret1,
  refreshToken: gmail.refreshToken1,
}

const ORG_A_GMAIL_CREDS3 = {
  email: gmail.emailId3,
  clientId: gmail.clientId3,
  clientSecret: gmail.clientSecret3,
  refreshToken: gmail.refreshToken3,
}

const ORG_A_GMAIL_CREDS4 = {
  email: gmail.emailId4,
  clientId: gmail.clientId4,
  clientSecret: gmail.clientSecret4,
  refreshToken: gmail.refreshToken4,
}

const ORG_B_GMAIL_CREDS = {
  email: gmail.emailId2,
  clientId: gmail.clientId2,
  clientSecret: gmail.clientSecret2,
  refreshToken: gmail.refreshToken2,
}

export default {
  OrganizationA: {
    organizationName: ORGANIZATION_A,
    costCenter1: {
      name: generateCostCenterName(ORGANIZATION_A, 'CostCenterA1'),
      addresses: [USA_ADDRESS_1],
    },
    costCenter2: {
      name: generateCostCenterName(ORGANIZATION_A, 'CostCenterA2'),
      addresses: [USA_ADDRESS_1, USA_ADDRESS_4],
      deleteAddress: USA_ADDRESS_3,
      temporaryAddress: USA_ADDRESS_2,
      receiverName: 'Robo2',
    },
    costCenter3: {
      temporaryName: generateCostCenterName(ORGANIZATION_A, 'cost3'),
      name: generateCostCenterName(ORGANIZATION_A, 'CostCenterA3'),
      addresses: [USA_ADDRESS_3],
    },
    costCenter4: {
      temporaryName: generateCostCenterName(ORGANIZATION_A, 'costA'),
      name: generateCostCenterName(ORGANIZATION_A, 'CostCenterA4'),
      addresses: [USA_ADDRESS_1, USA_ADDRESS_2, USA_ADDRESS_3],
    },
    collections: [
      {
        id: '141',
        name: 'Food',
      },
      {
        id: '140',
        name: 'Tech',
      },
      {
        id: '144',
        name: 'Clothes',
      },
    ],
    paymentTerms: [
      {
        id: '201',
        name: 'Promissory',
      },
      {
        id: '202',
        name: 'NET 30',
      },
    ],
    priceTables: 'gold',
    product: PRODUCTS.orange,
    product2: PRODUCTS.coconut,
    product3: PRODUCTS.tshirt,
    nonAvailableProduct: PRODUCTS.irobot,
    quotes: quotesListForOrganizationA(),
    users: {
      OrganizationAdmin1: {
        gmailCreds: ORG_A_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS.email,
          ORGANIZATION_A,
          ROLE_DROP_DOWN_EMAIL_MAPPING.OrganizationAdmin1.suffixInEmail
        ),
      },
      OrganizationAdmin2: {
        gmailCreds: ORG_A_GMAIL_CREDS4,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS4.email,
          ORGANIZATION_A,
          ROLE_DROP_DOWN_EMAIL_MAPPING.OrganizationAdmin2.suffixInEmail
        ),
      },
      Buyer1: {
        gmailCreds: ORG_A_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS.email,
          ORGANIZATION_A,
          ROLE_DROP_DOWN_EMAIL_MAPPING.Buyer1.suffixInEmail
        ),
      },
      Buyer2: {
        gmailCreds: ORG_A_GMAIL_CREDS3,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS3.email,
          ORGANIZATION_A,
          ROLE_DROP_DOWN_EMAIL_MAPPING.Buyer2.suffixInEmail
        ),
      },
      Buyer3: {
        gmailCreds: ORG_A_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS.email,
          ORGANIZATION_A,
          ROLE_DROP_DOWN_EMAIL_MAPPING.Buyer3.suffixInEmail
        ),
      },
      Buyer4: {
        gmailCreds: ORG_A_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS.email,
          ORGANIZATION_A,
          ROLE_DROP_DOWN_EMAIL_MAPPING.Buyer4.suffixInEmail
        ),
      },
      Approver1: {
        gmailCreds: ORG_A_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS.email,
          ORGANIZATION_A,
          ROLE_DROP_DOWN_EMAIL_MAPPING.Approver1.suffixInEmail
        ),
      },
      Approver2: {
        gmailCreds: ORG_A_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS3.email,
          ORGANIZATION_A,
          ROLE_DROP_DOWN_EMAIL_MAPPING.Approver2.suffixInEmail
        ),
      },
      Approver3: {
        gmailCreds: ORG_A_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS.email,
          ORGANIZATION_A,
          ROLE_DROP_DOWN_EMAIL_MAPPING.Approver3.suffixInEmail
        ),
      },
      SalesRepresentative: {
        gmailCreds: ORG_A_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS.email,
          ORGANIZATION_A,
          ROLE_ID_EMAIL_MAPPING.SalesRepresentative.suffixInEmail
        ),
      },
      SalesAdmin: {
        gmailCreds: ORG_B_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_B_GMAIL_CREDS.email,
          ORGANIZATION_A,
          ROLE_ID_EMAIL_MAPPING.SalesAdmin.suffixInEmail
        ),
      },
      SalesManager: {
        gmailCreds: ORG_B_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_A_GMAIL_CREDS4.email,
          ORGANIZATION_A,
          ROLE_ID_EMAIL_MAPPING.SalesManager.suffixInEmail
        ),
      },
    },
  },
  OrganizationB: {
    organizationName: ORGANIZATION_B,
    costCenter1: {
      name: generateCostCenterName(ORGANIZATION_B, 'CostCenterB1'),
      addresses: [USA_ADDRESS_2],
    },
    collections: [
      {
        id: '143',
        name: 'House',
      },
      {
        id: '142',
        name: 'Tools',
      },
    ],
    paymentTerms: [
      {
        id: '202',
        name: 'NET 30',
      },
    ],
    priceTables: 'silver',
    product: PRODUCTS.irobot,
    nonAvailableProduct: PRODUCTS.tshirt,
    quotes: quotesListForOrganizationB(),
    users: {
      OrganizationAdmin1: {
        gmailCreds: ORG_B_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_B_GMAIL_CREDS.email,
          ORGANIZATION_B,
          ROLE_DROP_DOWN_EMAIL_MAPPING.OrganizationAdmin1.suffixInEmail
        ),
      },

      Buyer1: {
        gmailCreds: ORG_B_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_B_GMAIL_CREDS.email,
          ORGANIZATION_B,
          ROLE_DROP_DOWN_EMAIL_MAPPING.Buyer1.suffixInEmail
        ),
      },
      Approver1: {
        gmailCreds: ORG_B_GMAIL_CREDS,
        email: generateEmailWithSuffix(
          ORG_B_GMAIL_CREDS.email,
          ORGANIZATION_B,
          ROLE_DROP_DOWN_EMAIL_MAPPING.Approver1.suffixInEmail
        ),
      },
    },
  },
}
