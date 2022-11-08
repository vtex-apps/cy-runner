export default {
  account: (baseUrl, seller) => {
    return `${baseUrl}/_v/api/adyen-platforms/v0/account?seller=${seller}`
  },
  onboarding: (baseUrl, token) => {
    return `${baseUrl}/_v/api/adyen-platforms/v0/onboarding?token=${token}`
  },
  hook: (baseUrl) => {
    return `${baseUrl}/_v/api/connector-adyen/v0/hook`
  },
}
