import { loginViaCookies, updateRetry } from '../../support/common/support.js'
import {
  graphql,
  saveAppSetting,
  validateSaveAppSettingResponse,
} from '../../support/fedex-shipping/graphql_testcase.js'
import {
  appSetting,
  smartPackingAccessKey,
} from '../../support/fedex-shipping/outputvalidation.js'
import { data } from '../../fixtures/fedex-shipping-fixtures/shippingOptimizePayload.json'
import {
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase.js'
import { FEDEX_SHIPPING_APP } from '../../support/fedex-shipping/graphql_apps.js'
import fedexSelectors from '../../support/common/selectors.js'
import sla from '../../support/fedex-shipping/sla.js'

const prefix = 'Shipping Optimize'
let NonePackingShippingPrice = ''
let PackAllInOneShippingPrice = ''
let SmartPackingShippingPrice = ''

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`${prefix} - Generate access key`, updateRetry(2), () => {
    cy.visit('/admin/app/packing-optimization')
    cy.get(fedexSelectors.SmartPackingAccessKey)
      .should('be.visible')
      .clear()
      .type(smartPackingAccessKey)
    cy.contains('Save').click()
    cy.get(fedexSelectors.PickingOptimizeAlert).should(
      'have.text',
      'Successfully Saved'
    )
    cy.get(fedexSelectors.PackingBoxLength).clear().type(30)
    cy.get(fedexSelectors.PackingBoxHeight).clear().type(30)
    cy.get(fedexSelectors.PackingBoxWidth).clear().type(30)
    // cy.get('#description').type('test')
    cy.contains('Add To Table').click()
    cy.get(fedexSelectors.PackingBoxTable).should('be.exist')
  })

  it(
    `${prefix} - Select shipping optiomize type None and validate`,
    updateRetry(3),
    () => {
      appSetting.optimizeShippingType = 0 // Update shipping type to None

      cy.readAppSettingsFromJSON().then((sl) => {
        graphql(
          FEDEX_SHIPPING_APP,
          saveAppSetting(appSetting, sl),
          validateSaveAppSettingResponse
        )
      })
      cy.addDelayBetweenRetries(3000)
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        const filtershippingMethod = response.body.filter(
          (b) => b.shippingMethod === sla.FirstOvernight
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

      cy.readAppSettingsFromJSON().then((getSla) => {
        graphql(
          FEDEX_SHIPPING_APP,
          saveAppSetting(appSetting, getSla),
          validateSaveAppSettingResponse
        )
      })
      cy.addDelayBetweenRetries(3000)
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        const filtershippingMethod = response.body.filter(
          (b) => b.shippingMethod === sla.FirstOvernight
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

      cy.readAppSettingsFromJSON().then((s) => {
        // update settings
        graphql(
          FEDEX_SHIPPING_APP,
          saveAppSetting(appSetting, s),
          validateSaveAppSettingResponse
        )
      })
      cy.addDelayBetweenRetries(6000)
      loadCalculateShippingAPI(data).then((response) => {
        validateCalculateShipping(response)
        const filtershippingMethod = response.body.filter(
          (b) => b.shippingMethod === sla.FirstOvernight
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
