/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { updateRetry, loginViaCookies } from '../../support/common/support'
import { appSetting } from '../../support/fedex-shipping/outputvalidation'
import { FEDEX_SHIPPING_APP } from '../../support/fedex-shipping/graphql_apps.js'
import {
  graphql,
  saveAppSetting,
  validateSaveAppSettingResponse,
} from '../../support/fedex-shipping/graphql_testcase.js'
import { data } from '../../fixtures/fedex-shipping-fixtures/shippingRatePayload.json'
import { loadCalculateShippingAPI } from '../../support/fedex-shipping/api_testcase.js'

const prefix = 'Hide Sla'

describe('FedEx Hide sla scenarios', () => {
  loginViaCookies()

  it(`${prefix} - Hide all Sla's`, updateRetry(3), () => {
    cy.hideSla(true).then((sla) => {
      graphql(
        FEDEX_SHIPPING_APP,
        saveAppSetting(appSetting, sla),
        validateSaveAppSettingResponse
      )
    })
  })

  it(`${prefix} - Verify all sla's are not displaying`, updateRetry(2), () => {
    loadCalculateShippingAPI(data).then((response) => {
      expect(response.status).to.have.equal(200)
      expect(response.body).to.be.an('array').and.to.have.lengthOf(0)
    })
  })
})
