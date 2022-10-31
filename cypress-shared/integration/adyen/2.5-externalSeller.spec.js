/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { externalSeller } from '../../support/outputvalidation.js'
import { getTestVariables } from '../../support/common/testcase.js'
import { completePyamentWithDinersCard } from '../../support/adyen/testcase.js'

describe('External Seller Testcase', () => {
  loginViaCookies()

  const { prefix, product1Name, product2Name, postalCode } = externalSeller

  const { orderIdEnv } = getTestVariables(prefix)

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

  completePyamentWithDinersCard(prefix, orderIdEnv)

  preserveCookie()
})
