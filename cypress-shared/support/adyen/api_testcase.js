import { account, onboarding, hook } from './apis.js'
import { updateRetry } from '../common/support'
import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from '../common/constants'

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
  it('Get Onboarding', updateRetry(3), () => {
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
    cy.request({
      method: 'POST',
      url: hook(baseUrl),
      headers: {
        ...VTEX_AUTH_HEADER(apiKey, apiToken),
      },
      auth: {
        username: adyenWebhookUsername,
        password: adyenWebhookPassword,
      },
      ...FAIL_ON_STATUS_CODE,
      body: data,
    }).then((response) => {
      expect(response.status).to.have.equal(200)
    })
  })
}
