/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import { discountProduct } from '../../support/adyen/outputvalidation'
import {
  getTestVariables,
  checkoutProduct,
} from '../../support/common/testcase.js'
import { completePaymentWithDinersCard } from '../../support/adyen/testcase.js'
import selectors from '../../support/common/selectors.js'

const { prefix, total } = discountProduct

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  const { orderIdEnv } = getTestVariables(prefix)

  checkoutProduct(discountProduct)

  it(`In ${prefix} - Verifying total amounts and discount for a discounted product`, () => {
    // Verify Total
    cy.verifyTotal(total)
    // Verify Discounts
    cy.get(selectors.Discounts).last().should('be.visible')
  })

  completePaymentWithDinersCard(prefix, orderIdEnv)

  preserveCookie()
})
