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

  // eslint-disable-next-line jest/expect-expect
  it(
    `In SkuCode Quantity testcase - Verify quantity by price & getSkuFromRefIds graphql`,
    updateRetry(4),
    () => {
      cy.qe(`Verify the quantity to 2 in the checkout page`)
      cy.get('.quantity.badge').first().should('have.text', '2')
      cy.window().then(($win) => {
        cy.qe(`Get Sku's from orderformId using GraphQL
      `)
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
