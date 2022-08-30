import { updateRetry, loginViaCookies } from '../../support/common/support'
import {
  graphql,
  version,
  affirmSettings,
  orderData,
  validateGetVersionResponse,
  validateAffirmSettingsResponse,
  validateOrderDataResponse,
} from '../../support/affirm/graphql_testcase'

const prefix = 'Graphql testcase'

describe('Affirm GraphQL Validation', () => {
  loginViaCookies()

  it(`${prefix} - Get Version`, updateRetry(3), () => {
    graphql(version(), validateGetVersionResponse)
  })

  it(`${prefix} - Affirm Settings`, updateRetry(3), () => {
    graphql(affirmSettings(), validateAffirmSettingsResponse)
  })

  it(`${prefix} - Get Order Data`, updateRetry(3), () => {
    graphql(orderData(), validateOrderDataResponse)
  })
})
