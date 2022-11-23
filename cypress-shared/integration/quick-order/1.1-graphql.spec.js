import { graphql } from '../../support/common/graphql_utils.js'
import {
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support.js'
import {
  getSellers,
  validateSellers,
  getSkuFromRefIds,
  validateSkuFromRefIdsResponse,
} from '../../support/quick-order/graphql.js'

const APP = 'vtex.quickorder@*.x'

describe('Graphql testcase', () => {
  loginViaCookies()

  it('seller query', () => {
    graphql(APP, getSellers(), validateSellers)
  })

  it.skip('skuFromRefIds query', () => {
    graphql(
      APP,
      getSkuFromRefIds('293938fb410a44c58d693e38b7ce0a59'),
      validateSkuFromRefIdsResponse
    )
  })

  preserveCookie()
})
