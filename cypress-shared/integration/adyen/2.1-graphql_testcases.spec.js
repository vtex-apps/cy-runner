/* eslint-disable padding-line-between-statements */
/* eslint-disable jest/expect-expect */
import {
  createAccountHolder,
  validateCreateAccountHolderResponse,
  refreshOnboarding,
  validateRefreshOnboardingResponse,
  closeAccountHolder,
  validateCloseAccountHolderResponse,
  sellers,
  validateSellersResponse,
  validateonboardingComplete,
  onboardingComplete,
  validateGetAdyenAccountResponse,
  getAdyenAccount,
  adyenAccountHolder,
  updateAccount,
  validateAdyenAccountHolderResponse,
  validateUpdateAccount,
} from '../../support/adyen/graphql_testcase'
import { graphql } from '../../support/common/graphql_utils'
import { APP } from '../../support/adyen/constants'
import { updateRetry, loginViaCookies } from '../../support/common/support'
import { createAccount, schedule } from '../../support/adyen/outputvalidation'
import { getAllAccount, getOnBoarding } from '../../support/adyen/api_testcase'
import { createOnBoardingLink } from '../../support/adyen/testcase'
import { deleteAccountHoldersFromMasterData } from '../../support/adyen/adyen_apis.js'

const accountJson = '.account.json'
const accountHolderJson = '.accountholder.json'
const accountTokenJson = '.accounttoken.json'
const accountHolderCodeJson = '.accountholderCode.json'

const { sellerId } = createAccount
const prefix = 'Graphql testcase'

//  Don't change the order,it has dependency.
describe('Adyen GraphQL Validation', () => {
  loginViaCookies()

  deleteAccountHoldersFromMasterData()

  it(`${prefix} - Create Account Holder`, updateRetry(2), () => {
    graphql(APP, createAccountHolder(createAccount), (response) => {
      validateCreateAccountHolderResponse(response)
      cy.writeFile(accountJson, {
        newAccount: response.body.data.createAccountHolder.adyenAccountHolder,
      })
    })
  })

  it(`${prefix} - Get Sellers`, updateRetry(2), () => {
    graphql(APP, sellers(), validateSellersResponse)
  })

  it(`${prefix} - Get Adyen Account`, updateRetry(2), () => {
    graphql(APP, getAdyenAccount(), validateGetAdyenAccountResponse)
  })

  it(`${prefix} - Adyen Account Holder`, updateRetry(2), () => {
    graphql(
      APP,
      adyenAccountHolder(sellerId),
      validateAdyenAccountHolderResponse
    )
  })

  it(`${prefix} - Refresh On Boarding`, updateRetry(2), () => {
    cy.readFile(accountJson).then((items) => {
      graphql(
        APP,
        refreshOnboarding(items.newAccount.accountHolderCode),
        (response) => {
          validateRefreshOnboardingResponse(response)
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
        APP,
        updateAccount(accountCode[0].accountCode, schedule),
        validateUpdateAccount
      )
    })
  })

  it(`${prefix} - onboardingComplete`, updateRetry(2), () => {
    cy.readFile(accountHolderCodeJson).then((items) => {
      const { accountHolderCode } = items
      graphql(
        APP,
        onboardingComplete(accountHolderCode),
        validateonboardingComplete
      )
    })
  })

  createOnBoardingLink(false)

  it(`${prefix} - Close Account Holder`, updateRetry(2), () => {
    cy.readFile(accountJson).then((items) => {
      graphql(
        APP,
        closeAccountHolder(items.newAccount.accountHolderCode),
        validateCloseAccountHolderResponse
      )
    })
  })
})
