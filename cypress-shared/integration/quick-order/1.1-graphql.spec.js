import { graphql } from '../../support/common/graphql_utils.js'
import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import {
  APP,
  getSellers,
  validateSellers,
} from '../../support/quick-order/graphql.js'

describe('Graphql testcase', () => {
  loginViaCookies()

  it('seller query', () => {
    cy.qe(`
    seller query - 'query' +
    '{sellers @context(provider: "vtex.quickorder")' +
    '{items{id,name}}}',
    `)
    graphql(APP, getSellers(), validateSellers)
  })

  preserveCookie()
})
