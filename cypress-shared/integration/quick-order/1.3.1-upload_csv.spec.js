import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { quickOrderByXLS } from '../../support/quick-order/testcase.js'

describe('Quickorder - Upload CSV testcase', () => {
  loginViaCookies()

  quickOrderByXLS(false)

  it(
    `In Upload CSV testcase - Verify quantity by price`,
    updateRetry(4),
    () => {
      cy.get('.quantity.badge').first().should('have.text', '2')
      cy.get('.quantity.badge').last().should('have.text', '50')
    }
  )

  preserveCookie()
})
