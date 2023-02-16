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
      cy.qe(
        'Verify the quantity in the quantity badge and the first item should contain 2 and last item should contain 50'
      )
      cy.get('.quantity.badge').first().should('have.text', '2')
      cy.get('.quantity.badge').last().should('have.text', '50')
    }
  )

  preserveCookie()
})
