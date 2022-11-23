import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import {
  quickOrderByXLS,
  quickOrderByXLSNegativeTestCase2,
} from '../../support/quick-order/testcase.js'

describe('Quickorder - SkuCode Quantity testcase', () => {
  loginViaCookies()

  quickOrderByXLSNegativeTestCase2(false)
  quickOrderByXLS(false)

  it(
    `In SkuCode Quantity testcase - Updating Shipping Information`,
    updateRetry(4),
    () => {
      // Update Shipping Section
      cy.updateShippingInformation({
        postalCode: '33180',
        phoneNumber: '(312) 310 3249',
        timeout: 10000,
      })
    }
  )

  it(
    `In SkuCode Quantity testcase - Verify quantity by price`,
    updateRetry(4),
    () => {
      cy.get('.quantity.badge').first().should('have.text', '2')
      cy.get('.quantity.badge').last().should('have.text', '1')
    }
  )

  it(
    'In SkuCode Quantity testcase - Ordering the product',
    updateRetry(2),
    () => {
      cy.orderProduct()
    }
  )

  preserveCookie()
})
