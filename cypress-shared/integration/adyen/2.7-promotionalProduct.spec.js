/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { promotionProduct } from '../../support/common/outputvalidation.js'
import {
  getTestVariables,
  checkoutProduct,
} from '../../support/common/testcase'
import { completePyamentWithDinersCard } from '../../support/adyen/testcase.js'

describe('Promotional Product scenarios', () => {
  loginViaCookies()

  const { prefix } = promotionProduct

  const { orderIdEnv } = getTestVariables(prefix)

  checkoutProduct(promotionProduct)

  it(`In ${prefix} - Verify free product is added`, updateRetry(3), () => {
    // Verify free product is added
    cy.get('span[class="new-product-price"]')
      .first()
      .should('have.text', 'Free')
  })

  completePyamentWithDinersCard(prefix, orderIdEnv)

  preserveCookie()
})
