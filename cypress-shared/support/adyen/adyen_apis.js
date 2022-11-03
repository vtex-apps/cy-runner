import { FAIL_ON_STATUS_CODE } from '../common/constants'
import { updateRetry } from '../common/support'

const config = Cypress.env()
const { name } = config.workspace
const { adyenCompanyID, adyenApiKey } = config.base.vtex

export function createAdyenWebhook() {
  it(`Create standard notification webhook in Adyen`, updateRetry(4), () => {
    cy.addDelayBetweenRetries(10000)
    cy.request({
      method: 'POST',
      url: `https://management-test.adyen.com/v1/companies/${adyenCompanyID}/webhooks`,
      headers: {
        'X-API-Key': adyenApiKey,
      },
      body: {
        type: 'standard',
        url: `https://${name}--productusqa.myvtex.com/_v/api/connector-adyen/v0/hook`,
        username: 'VTEX',
        password: 'VTEX',
        active: 'true',
        sslVersion: 'TLSv1.2',
        communicationFormat: 'json',
        acceptsExpiredCertificate: 'false',
        acceptsSelfSignedCertificate: 'true',
        acceptsUntrustedRootCertificate: 'true',
        populateSoapActionHeader: 'false',
        filterMerchantAccountType: 'allAccounts',
        filterMerchantAccounts: [],
      },
      ...FAIL_ON_STATUS_CODE,
    }).then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body.active).to.equal(true)
      cy.setOrderItem('adyenWebhookID', response.body.id)
    })
  })
}

export function deleteAdyenWebhook() {
  it(`Delete webhook in Adyen`, updateRetry(4), () => {
    cy.addDelayBetweenRetries(10000)
    cy.getOrderItems().then((item) => {
      cy.request({
        method: 'DELETE',
        url: `https://management-test.adyen.com/v1/companies/${adyenCompanyID}/webhooks/${item.adyenWebhookID}`,
        headers: {
          'X-API-Key': adyenApiKey,
        },
        ...FAIL_ON_STATUS_CODE,
      }).then((response) => {
        expect(response.status).to.equal(204)
      })
    })
  })
}
