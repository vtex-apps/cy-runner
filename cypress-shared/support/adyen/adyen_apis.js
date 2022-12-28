import { FAIL_ON_STATUS_CODE } from '../common/constants'
import { updateRetry } from '../common/support'

const config = Cypress.env()
const { name } = config.workspace
const {
  adyenCompanyID,
  adyenApiKey,
  baseUrl,
  adyenWebhookUsername,
  adyenWebhookPassword,
} = config.base.vtex

const webhookJson = '.webhook.json'

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
        username: adyenWebhookUsername,
        password: adyenWebhookPassword,
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
      cy.writeFile(webhookJson, {
        adyenWebhookID: response.body.id,
      })
    })
  })
}

export function deleteAdyenWebhook() {
  it(`Delete webhook in Adyen`, updateRetry(4), () => {
    cy.addDelayBetweenRetries(10000)
    cy.readFile(webhookJson).then((webhookid) => {
      cy.request({
        method: 'DELETE',
        url: `https://management-test.adyen.com/v1/companies/${adyenCompanyID}/webhooks/${webhookid.adyenWebhookID}`,
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

export function verifyOrderInAdyen(product, { paymentTidEnv }, refund = false) {
  it(`In ${product.prefix} - Verify order in adyen`, updateRetry(4), () => {
    cy.addDelayBetweenRetries(10000)
    cy.getOrderItems().then((item) => {
      cy.request({
        method: 'GET',
        url: `https://ca-test.adyen.com/ca/ca/ui-api/payments/v1/pspref/${item[paymentTidEnv]}/details`,
        ...FAIL_ON_STATUS_CODE,
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.paymentOverview.pspReference).to.equal(
          item[paymentTidEnv]
        )
        if (refund) {
          expect(response.body.paymentOverview.status).to.equal('SentForRefund')
        }
      })
    })
  })
}

export function deleteAccountHoldersFromMasterData() {
  it('Delete account holders from master data', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/_v/api/adyen-platforms/v0/account?seller=productusqaseller`,
      ...FAIL_ON_STATUS_CODE,
    }).then(({ status, body }) => {
      expect(status).to.equal(200)
      for (const { accountHolderCode } of body) {
        cy.request({
          method: 'GET',
          url: `https://productusqa.myvtex.com/api/dataentities/account/search?accountHolderCode=${accountHolderCode}&_schema=account-dev@0.1`,
          ...FAIL_ON_STATUS_CODE,
        }).then((entitySearchResponse) => {
          const [{ id }] = entitySearchResponse.body

          expect(entitySearchResponse.status).to.equal(200)
          cy.request({
            method: 'DELETE',
            url: `https://productusqa.myvtex.com/api/dataentities/account/documents/${id}`,
            ...FAIL_ON_STATUS_CODE,
          }).then((deleteDocumentResponse) => {
            expect(deleteDocumentResponse.status).to.equal(204)
          })
        })
      }
    })
  })
}
