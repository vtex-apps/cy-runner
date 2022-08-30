/* eslint-disable jest/expect-expect */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import { externalSeller } from '../../support/common/outputvalidation'
import {
  getTestVariables,
  invoiceAPITestCase,
  sendInvoiceTestCase,
} from '../../support/common/testcase.js'
import { completeThePayment } from '../../support/affirm/testcase.js'

const { prefix, product1Name, product2Name, pickUpPostalCode } = externalSeller
const externalSellerEnvs = getTestVariables(prefix)

externalSellerEnvs.sendInvoice = false

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(1), () => {
    // Search the product
    cy.searchProduct(product1Name)
    // Add product to cart
    cy.addProduct(product1Name, {
      proceedtoCheckout: false,
    })
    // Search the product
    cy.searchProduct(product2Name)
    // Add product to cart
    cy.addProduct(product2Name, {
      proceedtoCheckout: true,
    })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(4), () => {
    // Update Shipping Section
    cy.updateShippingInformation({
      postalCode: pickUpPostalCode,
      phoneNumber: '(312) 310 3249',
    })
  })

  completeThePayment(externalSeller, externalSellerEnvs, true)
})

describe('Testing Invoice API for Direct Sale', () => {
  it('Get Direct Sale orderId and update in Cypress env', () => {
    cy.getOrderItems().then((order) => {
      if (!order[externalSeller.directSaleEnv]) {
        throw new Error('Direct Sale Order id is missing')
      }
    })
  })

  sendInvoiceTestCase({
    product: externalSeller,
    orderIdEnv: externalSeller.directSaleEnv,
    externalSellerTestcase: true,
  })

  // Get transactionId from invoiceAPI and store in .orders.json
  invoiceAPITestCase({
    product: externalSeller,
    env: externalSeller.directSaleEnv,
    transactionIdEnv: externalSellerEnvs.transactionIdEnv,
  })
})

describe('Testing Invoice API for External Sale', () => {
  it('Get External Sale orderId and update in Cypress env', () => {
    cy.getOrderItems().then((order) => {
      if (!order[externalSeller.externalSaleEnv]) {
        throw new Error('External Sale Order id is missing')
      }
    })
  })

  sendInvoiceTestCase({
    product: externalSeller,
    orderIdEnv: externalSeller.externalSaleEnv,
    externalSellerTestcase: true,
  })

  // Get transactionId from invoiceAPI and store in .orders.json
  invoiceAPITestCase({
    product: externalSeller,
    env: externalSeller.externalSaleEnv,
    transactionIdEnv: externalSellerEnvs.transactionIdEnv,
  })
})
