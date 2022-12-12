import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { quickOrderBySkuAndQuantityTestCase1 } from '../../support/quick-order/testcase.js'
import { graphql } from '../../support/common/graphql_utils.js'
import {
  APP,
  getSkuFromRefIds,
  validateSkuFromRefIdsResponse,
} from '../../support/quick-order/graphql.js'

describe('Quickorder - SkuCode Quantity testcase', () => {
  loginViaCookies()

  quickOrderBySkuAndQuantityTestCase1('user', null)

  it(
    `In SkuCode Quantity testcase - Verify quantity by price & getSkuFromRefIds graphql`,
    updateRetry(4),
    () => {
      cy.get('.quantity.badge').first().should('have.text', '2')
      cy.window().then(($win) => {
        graphql(
          APP,
          getSkuFromRefIds($win.vtexjs.checkout.orderForm.orderFormId),
          validateSkuFromRefIdsResponse
        )
      })
    }
  )

  preserveCookie()
})
