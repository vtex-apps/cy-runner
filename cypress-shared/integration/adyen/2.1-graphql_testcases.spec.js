/* eslint-disable padding-line-between-statements */
/* eslint-disable jest/expect-expect */
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
  updateAccount,
  validateAdyenAccountHolderResponse,
  validateUpdateAccount,
} from '../../support/adyen/graphql_testcase'
import { updateRetry, loginViaCookies } from '../../support/common/support'
import { createAccount, schedule } from '../../support/adyen/outputvalidation'
import { getAllAccount, getOnBoarding } from '../../support/adyen/api_testcase'

const ordersJson = '.orders.json'
const accountHolderJson = '.accountholder.json'
const accountTokenJson = '.accounttoken.json'
const { sellerId } = createAccount
const prefix = 'Graphql testcase'

//  Don't change the order,it has dependency.
describe('Adyen GraphQL Validation', () => {
  loginViaCookies()

  it(`${prefix} - Create Account Holder`, updateRetry(2), () => {
    graphql(createAccountHolder(createAccount), (response) => {
      validateCreateAccountHolderResponse(response)
      cy.writeFile(ordersJson, {
        newAccount: response.body.data.createAccountHolder.adyenAccountHolder,
      })
    })
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
    cy.readFile(ordersJson).then((items) => {
      graphql(
        refreshOnboarding(items.newAccount.accountHolderCode),
        (response) => {
          validateRefreshOnboardingResponse
          cy.writeFile(accountTokenJson, {
            accountToken: response.body.data.refreshOnboarding,
          })
        }
      )
    })
  })

  getOnBoarding()

  getAllAccount(sellerId)

  it(`${prefix} - updateAccount`, updateRetry(2), () => {
    cy.readFile(accountHolderJson).then((items) => {
      const accountCode = items.accountList
      for (const account in accountCode) {
        if (
          accountCode[account].accountHolderCode === items.accountHolderCode
        ) {
          accountCode[account].status = 'Active'
        }
      }
      graphql(
        updateAccount(accountCode[0].accountCode, schedule),
        validateUpdateAccount
      )
    })
  })

  it(`${prefix} - Close Account Holder`, updateRetry(2), () => {
    cy.readFile(ordersJson).then((items) => {
      graphql(
        closeAccountHolder(items.newAccount.accountHolderCode),
        validateCloseAccountHolderResponse
      )
    })
  })
})
