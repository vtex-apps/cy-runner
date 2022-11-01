import {
  graphql,
  createAccountHolder,
  validateCreateAccountHolderResponse,
  refreshOnboarding,
  validateRefreshOnboardingResponse,
  closeAccountHolder,
  validateCloseAccountHolderResponse,
  sellers,
  validateSellersResponse,
  validateGetAdyenAccountResponse,
  getAdyenAccount,
  adyenAccountHolder,
  validateAdyenAccountHolderResponse,
} from '../../support/adyen/graphql_testcase'
import { updateRetry, loginViaCookies } from '../../support/common/support'
import { createAccount } from '../../support/adyen/outputvalidation'

const {accountHolderCode,sellerId} = createAccount;
const prefix = 'Graphql testcase'

describe('Adyen GraphQL Validation', () => {
  loginViaCookies()

  it(`${prefix} - Create Account Holder`, updateRetry(2), () => {
    graphql(
      createAccountHolder(createAccount),
      validateCreateAccountHolderResponse
    )
  })

  it(`${prefix} - Get Sellers`, updateRetry(2), () => {
    graphql(sellers(), validateSellersResponse)
  })

  it(`${prefix} - Get Adyen Account`, updateRetry(2), () => {
    graphql(getAdyenAccount(), validateGetAdyenAccountResponse)
  })

  it(`${prefix} - Adyen Account Holder`, updateRetry(2), () => {
    graphql(adyenAccountHolder(sellerId), validateAdyenAccountHolderResponse)
  })

  it(`${prefix} - Refresh On Boarding`, updateRetry(2), () => {
    graphql(refreshOnboarding(accountHolderCode), validateRefreshOnboardingResponse)
  })

  it(`${prefix} - Close Account Holder`, updateRetry(2), () => {
    graphql(closeAccountHolder(accountHolderCode), validateCloseAccountHolderResponse)
  })
})
