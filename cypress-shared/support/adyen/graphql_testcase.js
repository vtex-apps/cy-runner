/* eslint-disable jest/expect-expect */

export function sellers() {
  return {
    query:
      'query' +
      '{sellers @context(provider: "vtex.adyen-platforms"){id,name,logo,isActive,fulfillmentEndpoint,allowHybridPayments,taxCode,email,description,sellerCommissionConfiguration}}',
    queryVariables: {},
  }
}

export function getAdyenAccount() {
  return {
    query:
      'query' +
      '{getAdyenAccount{accountHolderCode,urlToken,accountHolderDetails{email}}}',
    queryVariables: {},
  }
}

export function adyenAccountHolder(payload) {
  return {
    query:
      'query' +
      '($sellerId:String)' +
      '{adyenAccountHolder(sellerId:$sellerId){accountHolderCode,urlToken,accountHolderStatus {status},accounts {accountCode,description,payoutSpeed,status},accountHolderDetails {email}}}',
    queryVariables: { sellerId: payload },
  }
}

export function createAccountHolder(createAccount) {
  const query =
    'mutation' +
    '($accountHolderCode:String!,$sellerId:String!,$country:String!,$legalBusinessName:String!,$email:String!,$legalEntity:String!,$processingTier:Int!)' +
    '{createAccountHolder(accountHolderCode:$accountHolderCode,sellerId:$sellerId,country:$country,legalBusinessName:$legalBusinessName,email:$email,legalEntity:$legalEntity,processingTier:$processingTier){adyenAccountHolder {accountHolderCode}}}'

  return {
    query,
    queryVariables: createAccount,
  }
}

export function closeAccountHolder(payload) {
  const query =
    'mutation' +
    '($accountHolderCode:String!)' +
    '{closeAccountHolder(accountHolderCode:$accountHolderCode){accountHolderCode,urlToken}}'

  return {
    query,
    queryVariables: {
      accountHolderCode: payload,
    },
  }
}

export function refreshOnboarding(payload) {
  const query =
    'mutation' +
    '($accountHolderCode:String!)' +
    '{refreshOnboarding(accountHolderCode:$accountHolderCode){accountHolderCode,urlToken}}'

  return {
    query,
    queryVariables: {
      accountHolderCode: payload,
    },
  }
}

export function updateAccount(accountCode, schedule) {
  const query =
    'mutation' +
    '($accountCode:String!,$schedule:String!)' +
    '{updateAccount (accountCode:$accountCode,schedule:$schedule) @context(provider: "vtex.adyen-platforms") {accountCode,schedule}}'

  return {
    query,
    queryVariables: {
      accountCode,
      schedule,
    },
  }
}

export function onboardingComplete(accountHolderCode) {
  const query =
    'mutation' +
    '($accountHolderCode:String!)' +
    '{onboardingComplete(accountHolderCode:$accountHolderCode){accountHolderCode,urlToken,invalidFields{errorDescription}}}'

  return {
    query,
    queryVariables: {
      accountHolderCode,
    },
  }
}

export function validateSellersResponse(response) {
  expect(response.body.data).to.not.equal(null)
}

export function validateGetAdyenAccountResponse(response) {
  expect(response.body.data).to.not.equal(null)
}

export function validateCreateAccountHolderResponse(response) {
  expect(
    response.body.data.createAccountHolder.adyenAccountHolder
  ).to.not.equal(null)
}

export function validateAdyenAccountHolderResponse(response) {
  expect(response.body.data).to.not.equal(null)
}

export function validateCloseAccountHolderResponse(response) {
  expect(response.body.data).to.not.equal(null)
}

export function validateRefreshOnboardingResponse(response) {
  expect(response.body.data.refreshOnboarding).to.not.equal(null)
}

export function validateUpdateAccount(response) {
  expect(response.body.data).to.not.equal(null)
}

export function validateonboardingComplete(response) {
  expect(response.body.data).to.not.equal(null)
}
