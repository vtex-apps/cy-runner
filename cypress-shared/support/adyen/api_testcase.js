import { account, onboarding, hook } from './apis.js'
import { updateRetry } from '../common/support'
import { VTEX_AUTH_HEADER } from '../common/constants'

const accountHolderJson = '.accountholder.json'
const accountTokenJson = '.accounttoken.json'
const config = Cypress.env()

const {
  baseUrl,
  apiKey,
  apiToken,
  adyenWebhookUsername,
  adyenWebhookPassword,
} = config.base.vtex

export function getAllAccount(seller) {
  it('Get All List of Account', updateRetry(3), () => {
    cy.getVtexItems().then((vtex) => {
      cy.getAPI(account(vtex.baseUrl, seller)).then((response) => {
        expect(response.status).to.have.equal(200)
        cy.writeFile(accountHolderJson, { accountList: response.body })
      })
    })
  })
}

export function getOnBoarding() {
  it('Get Onboarding', updateRetry(6), () => {
    cy.addDelayBetweenRetries(20000)
    cy.getVtexItems().then((vtex) => {
      cy.readFile(accountTokenJson).then((items) => {
        cy.getAPI(onboarding(vtex.baseUrl, items.accountToken.urlToken)).then(
          (response) => {
            expect(response.status).to.have.equal(200)
          }
        )
      })
    })
  })
}

export function Adyenhook(data) {
  it('Adyen Hook', updateRetry(3), () => {
    cy.callRestAPIAndAddLogs({
      url: hook(baseUrl),
      headers: {
        ...VTEX_AUTH_HEADER(apiKey, apiToken),
      },
      auth: {
        username: adyenWebhookUsername,
        password: adyenWebhookPassword,
      },
      body: data,
    }).then((response) => {
      expect(response.status).to.have.equal(200)
    })
  })
}
