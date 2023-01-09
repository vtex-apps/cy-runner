/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-expect-in-promise */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import {
  saveAppSetting,
  validateSaveAppSettingResponse,
} from '../../support/fedex-shipping/graphql_testcase.js'
import { graphql } from '../../support/common/graphql_utils'
import { appSetting } from '../../support/fedex-shipping/outputvalidation.js'
import { data } from '../../fixtures/fedex-shipping-fixtures/shippingRatePayload.json'
import {
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase.js'
import { FEDEX_SHIPPING_APP } from '../../support/fedex-shipping/graphql_apps.js'
import sla from '../../support/fedex-shipping/sla.js'

const prefix = 'Ship To Residential'

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`${prefix} - Disable Ship to Residential`, updateRetry(3), () => {
    appSetting.residential = false
    cy.readSlaSettings().then((sl) => {
      graphql(
        FEDEX_SHIPPING_APP,
        saveAppSetting(appSetting, sl),
        validateSaveAppSettingResponse
      )
    })
    loadCalculateShippingAPI(data).then((response) => {
      validateCalculateShipping(response)
      const filtershippingMethod = response.body.filter(
        (b) => b.shippingMethod === sla.FedexGroundDelivery
      )

      expect(filtershippingMethod)
        .to.be.an('array')
        .and.to.have.lengthOf.above(0)
    })
  })

  it(`${prefix} - Enable Ship to Residential`, updateRetry(3), () => {
    appSetting.residential = true
    cy.readSlaSettings().then((s) => {
      graphql(
        FEDEX_SHIPPING_APP,
        saveAppSetting(appSetting, s),
        validateSaveAppSettingResponse
      )
    })
    loadCalculateShippingAPI(data).then((response) => {
      validateCalculateShipping(response)
      const filtershippingMethod = response.body.filter(
        (b) => b.shippingMethod === sla.FedexHomeDelivery
      )

      expect(filtershippingMethod)
        .to.be.an('array')
        .and.to.have.lengthOf.above(0)
    })
  })
})
