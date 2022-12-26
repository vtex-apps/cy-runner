/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import {
  saveAppSetting,
  savePackingOptimizationAppSetting,
  validateSaveAppSettingResponse,
} from '../../support/fedex-shipping/graphql_testcase.js'
import {
  appSetting,
  smartPackingAccessKey,
  packingOptimizationSettings,
} from '../../support/fedex-shipping/outputvalidation.js'
import { data } from '../../fixtures/fedex-shipping-fixtures/shippingOptimizePayload.json'
import {
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase.js'
import {
  FEDEX_SHIPPING_APP,
  PACKING_OPTIMIZATION,
} from '../../support/fedex-shipping/graphql_apps.js'
import sla from '../../support/fedex-shipping/sla.js'
import { graphql } from '../../support/common/graphql_utils.js'

const prefix = 'Shipping Optimize'
let NonePackingShippingPrice = ''
let PackAllInOneShippingPrice = ''
let SmartPackingShippingPrice = ''

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`${prefix} - Generate access key`, updateRetry(2), () => {
    graphql(
      PACKING_OPTIMIZATION,
      savePackingOptimizationAppSetting(packingOptimizationSettings),
      validateSaveAppSettingResponse
    )
  })

  it(
    `${prefix} - Select shipping optimize type None and validate`,
    updateRetry(3),
    () => {
      appSetting.optimizeShippingType = 0 // Update shipping type to None

      cy.readSlaSettings().then((sl) => {
        graphql(
          FEDEX_SHIPPING_APP,
          saveAppSetting(appSetting, sl),
          validateSaveAppSettingResponse
        )
      })
      cy.addDelayBetweenRetries(10000)
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        const filtershippingMethod = response.body.filter(
          (b) =>
            b.shippingMethod === sla.FirstOvernight ||
            b.shippingMethod === sla.StandardOvernight
        )

        expect(filtershippingMethod)
          .to.be.an('array')
          .and.to.have.lengthOf.above(0)
        NonePackingShippingPrice = filtershippingMethod[0].price
      })
    }
  )

  it(
    `${prefix} - Select shipping optiomize type Pack All In One and validate`,
    updateRetry(3),
    () => {
      appSetting.optimizeShippingType = 1 // Update shipping type to Pack all in one

      cy.readSlaSettings().then((getSla) => {
        graphql(
          FEDEX_SHIPPING_APP,
          saveAppSetting(appSetting, getSla),
          validateSaveAppSettingResponse
        )
      })
      cy.addDelayBetweenRetries(10000)
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        const filtershippingMethod = response.body.filter(
          (b) =>
            b.shippingMethod === sla.FirstOvernight ||
            b.shippingMethod === sla.StandardOvernight
        )

        expect(filtershippingMethod)
          .to.be.an('array')
          .and.to.have.lengthOf.above(0)
        PackAllInOneShippingPrice = filtershippingMethod[0].price
      })
    }
  )

  it(
    `${prefix} - Select shipping optiomize type Smart Packing and validate`,
    updateRetry(3),
    () => {
      appSetting.optimizeShippingType = 2 // Update shipping type to Smart Packing
      appSetting.packingAccessKey = smartPackingAccessKey // Add Smart Packing Access Key

      cy.readSlaSettings().then((s) => {
        // update settings
        graphql(
          FEDEX_SHIPPING_APP,
          saveAppSetting(appSetting, s),
          validateSaveAppSettingResponse
        )
      })
      cy.addDelayBetweenRetries(10000)
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        const filtershippingMethod = response.body.filter(
          (b) =>
            b.shippingMethod === sla.FirstOvernight ||
            b.shippingMethod === sla.StandardOvernight
        )

        expect(filtershippingMethod)
          .to.be.an('array')
          .and.to.have.lengthOf.above(0)
        SmartPackingShippingPrice = filtershippingMethod[0].price
      })
    }
  )

  it(
    `${prefix} - Verify None shipping price is higher than Pack all in one box and Smart packing`,
    updateRetry(1),
    () => {
      expect(NonePackingShippingPrice).to.be.gt(PackAllInOneShippingPrice)
      expect(NonePackingShippingPrice).to.be.gt(SmartPackingShippingPrice)
    }
  )

  it(
    `${prefix} - Verify Pack all in one box shipping price is higher than None`,
    updateRetry(1),
    () => {
      expect(PackAllInOneShippingPrice).to.be.lt(NonePackingShippingPrice)
    }
  )

  it(
    `${prefix} - Verify Smart Packig shipping price is higher than None`,
    updateRetry(1),
    () => {
      expect(SmartPackingShippingPrice).to.be.lt(NonePackingShippingPrice)
      expect(SmartPackingShippingPrice).to.be.lte(PackAllInOneShippingPrice)
    }
  )
})
