import selectors from '../common/selectors'
import { fillContactInfo, saveOrderId, updateRetry } from '../common/support'
import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from '../common/constants'
import { startHandlingAPI } from '../common/apis'
import {
  invoiceAPITestCase,
  sendInvoiceTestCase,
  verifyOrderStatus,
} from '../common/testcase'

const config = Cypress.env()

// Constants
const { vtex } = config.base
const {
  apiKey,
  apiToken,
  baseUrl,
  adyenLoginUrl,
  adyenLoginUsername,
  adyenLoginAccount,
  adyenLoginPassword,
} = config.base.vtex

export function completePyamentWithDinersCard(
  prefix,
  orderIdEnv,
  externalSeller = false
) {
  it(`In ${prefix} - Ordering the product`, updateRetry(2), () => {
    cy.get(selectors.FirstName).then(($el) => {
      if (Cypress.dom.isVisible($el)) {
        fillContactInfo()
      }
    })
    cy.get(selectors.CreditCardLink).click()

    cy.getIframeBody(selectors.PaymentMethodIFrame).then(($body) => {
      if (!$body.find(selectors.CardExist).length) {
        // Credit cart not exist
        cy.getIframeBody(selectors.PaymentMethodIFrame)
          .find(selectors.CreditCardNumber)
          .type('3600 6666 3333 44')
        cy.getIframeBody(selectors.PaymentMethodIFrame)
          .find(selectors.CreditCardHolderName)
          .type('Testing')
        cy.getIframeBody(selectors.PaymentMethodIFrame)
          .find(selectors.CreditCardExpirationMonth)
          .select('03')
        cy.getIframeBody(selectors.PaymentMethodIFrame)
          .find(selectors.CreditCardExpirationYear)
          .select('30')
      }

      cy.getIframeBody(selectors.PaymentMethodIFrame).then(($paymentBtn) => {
        if ($paymentBtn.find(selectors.PaymentMethodIFrame).length) {
          cy.getIframeBody(selectors.PaymentMethodIFrame)
            .find('.SavedCard span[class*=Diners]')
            .click()
        }
      })

      cy.getIframeBody(selectors.PaymentMethodIFrame)
        .find(selectors.CreditCardCode)
        .type('737')
      cy.get(selectors.BuyNowBtn).last().click()
      saveOrderId(orderIdEnv, externalSeller)
    })
  })
}

export function verifyAdyenConnectorSettings() {
  it(`Verify adyen connector settings in UI`, updateRetry(2), () => {
    cy.visit('/admin/adyen')
    cy.getIframeBody(selectors.AdyenAdminIframe)
      .find(selectors.AdyenAdminSectionPB4)
      .contains('Adyen Merchant Account')
      .find('input')
      .should('have.value', vtex.merchantAccount)
    cy.getIframeBody(selectors.AdyenAdminIframe)
      .find(selectors.AdyenAdminSectionPB4)
      .contains('Adyen API Key')
      .find('input')
      .should('have.value', vtex.adyenApiKey)
    cy.getIframeBody(selectors.AdyenAdminIframe)
      .find(selectors.AdyenAdminSectionPB4)
      .contains('Adyen Production API URI')
      .find('input')
      .should('have.value', vtex.adyenProductionAPI)
    cy.getIframeBody(selectors.AdyenAdminIframe)
      .find(selectors.AdyenAdminSectionPB4)
      .contains('Adyen Webhook Username')
      .find('input')
      .should('have.value', vtex.adyenWebhookUsername)
    cy.getIframeBody(selectors.AdyenAdminIframe)
      .find(selectors.AdyenAdminSectionPB4)
      .contains('Adyen Webhook Password')
      .find('input')
      .should('have.value', vtex.adyenWebhookPassword)
    cy.getIframeBody(selectors.AdyenAdminIframe)
      .find(selectors.AdyenAdminSectionPB4)
      .contains('VTEX App Key')
      .find('input')
      .should('have.value', vtex.apiKey)
    cy.getIframeBody(selectors.AdyenAdminIframe)
      .find(selectors.AdyenAdminSectionPB6)
      .contains('VTEX App Token')
      .find('input')
      .should('have.value', vtex.apiToken)
    cy.getIframeBody(selectors.AdyenAdminIframe)
      .find(selectors.AdyenAdminUsePlatformToggle)
      .contains('Using Adyen for Platforms')
      .should('have.text', 'Using Adyen for Platforms')
  })
}

export function verifyAdyenPlatformSettings() {
  it(`Verify adyen platform settings in UI`, updateRetry(2), () => {
    cy.visit('/admin/app/adyen-for-platforms')
    cy.contains('Settings').should('be.visible')
    cy.contains('Settings').should('be.visible').click()
    cy.get(selectors.AdyenPlatformApiKey).should(
      'have.value',
      vtex.adyenPlatformApiKey
    )
    cy.get(selectors.AdyenPlatformProductionURI).should(
      'have.value',
      vtex.adyenPlatformProductionAPI
    )
  })
}

export function startHandlingOrder(product, env) {
  it(`In ${product.prefix} - Start handling order`, updateRetry(3), () => {
    cy.addDelayBetweenRetries(5000)
    cy.getOrderItems().then((item) => {
      cy.request({
        method: 'POST',
        url: startHandlingAPI(baseUrl, item[env]),
        headers: VTEX_AUTH_HEADER(apiKey, apiToken),
        ...FAIL_ON_STATUS_CODE,
      }).then((response) => {
        expect(response.status).to.match(/204|409/)
      })
    })
  })
}

export function orderTaxAPITestCase(fixtureName, tax) {
  // Verify tax amounts via order-tax API
  it(
    `For ${fixtureName} - Verify tax amounts via order-tax API`,
    { retries: 0 },
    () => {
      // Load fixtures request payload and use them in orderTax API
      cy.fixture(fixtureName).then((requestPayload) => {
        cy.orderTaxApi(requestPayload, tax)
      })
    }
  )
}

export function loginToAdyen() {
  it('Login to adyen dashboard', updateRetry(2), () => {
    cy.visit(adyenLoginUrl)
    cy.get(selectors.AdyenLoginUsername).type(adyenLoginUsername)
    cy.contains('Next').click()
    cy.get(selectors.AdyenLoginAccount).type(adyenLoginAccount)
    cy.get(selectors.AdyenLoginPassword).type(adyenLoginPassword)
    cy.get(selectors.AdyenLoginSubmit).click()
  })
}

export function verifyProductInvoiceTestcase(product, env) {
  verifyOrderStatus({
    product,
    env: env.orderIdEnv,
    status: 'ready-for-handling',
  })

  startHandlingOrder(product, env.orderIdEnv)

  verifyOrderStatus({
    product,
    env: env.orderIdEnv,
    status: 'handling',
  })

  invoiceAPITestCase({
    product,
    env: env.orderIdEnv,
    transactionIdEnv: env.transactionIdEnv,
  })

  sendInvoiceTestCase({
    product,
    orderIdEnv: env.orderIdEnv,
  })

  verifyOrderStatus({
    product,
    env: env.orderIdEnv,
    status: 'invoiced',
  })
}