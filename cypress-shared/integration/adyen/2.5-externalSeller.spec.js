/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { externalSeller } from '../../support/common/outputvalidation.js'
import {
  getTestVariables,
  invoiceAPITestCase,
  sendInvoiceTestCase,
  startHandlingOrder,
  verifyOrderStatus,
} from '../../support/common/testcase.js'
import { completePyamentWithDinersCard } from '../../support/adyen/testcase.js'

describe('External Seller Testcase', () => {
  loginViaCookies()

  const { prefix, product1Name, product2Name, postalCode } = externalSeller

  const { orderIdEnv, transactionIdEnv } = getTestVariables(prefix)

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(product1Name)
    // Add product to cart
    cy.addProduct(product1Name, { proceedtoCheckout: false })
    // Search the product
    cy.searchProduct(product2Name)
    // Add product to cart
    cy.addProduct(product2Name, { proceedtoCheckout: true })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({ postalCode })
  })

  completePyamentWithDinersCard(prefix, orderIdEnv, externalSeller)

  verifyOrderStatus({
    product: externalSeller,
    env: orderIdEnv,
    status: 'ready-for-handling',
  })

  startHandlingOrder(externalSeller, orderIdEnv)

  verifyOrderStatus({
    product: externalSeller,
    env: orderIdEnv,
    status: 'handling',
  })

  describe(`${prefix} - Testing Invoice API for External Sale`, () => {
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

    invoiceAPITestCase({
      product: externalSeller,
      env: externalSeller.externalSaleEnv,
      transactionIdEnv,
    })

    verifyOrderStatus({
      product: externalSeller,
      env: orderIdEnv,
      status: 'invoiced',
    })
  })

  describe(`${prefix} - Testing Invoice API for Direct Sale`, () => {
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
      transactionIdEnv,
    })

    verifyOrderStatus({
      product: externalSeller,
      env: orderIdEnv,
      status: 'invoiced',
    })
  })

  preserveCookie()
})
