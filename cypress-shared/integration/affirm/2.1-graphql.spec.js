import { updateRetry, loginViaCookies } from '../../support/common/support'
import {
  graphql,
  version,
  affirmSettings,
  orderData,
  orderUpdate,
  validateGetVersionResponse,
  validateAffirmSettingsResponse,
  validateOrderDataResponse,
  validateOrderUpdateResponse,
} from '../../support/affirm-payment/graphql_testcase'
import { orderInfo } from '../../support/affirm-payment/outputvalidation'

const prefix = 'Graphql testcase'

describe('Affirm GraphQL Validation', () => {
  loginViaCookies({ storeFrontCookie: true })

  it(`${prefix} - Get Version`, updateRetry(3), () => {
    graphql(version(), validateGetVersionResponse)
  })

  it(`${prefix} - Affirm Settings`, updateRetry(3), () => {
    graphql(affirmSettings(), validateAffirmSettingsResponse)
  })

  it(`${prefix} - Get Order Data`, updateRetry(3), () => {
    graphql(orderData(), validateOrderDataResponse)
  })

  it(`${prefix} - Order Update`, updateRetry(3), () => {
    graphql(orderUpdate(orderInfo), validateOrderUpdateResponse)
  })
})
