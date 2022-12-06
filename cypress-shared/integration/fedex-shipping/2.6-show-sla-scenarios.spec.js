/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-expect */
import { updateRetry, loginViaCookies } from '../../support/common/support.js'
import { appSetting } from '../../support/fedex-shipping/outputvalidation.js'
import { FEDEX_SHIPPING_APP } from '../../support/fedex-shipping/graphql_apps.js'
import {
  saveAppSetting,
  validateSaveAppSettingResponse,
} from '../../support/fedex-shipping/graphql_testcase.js'
import { graphql } from '../../support/common/graphql_utils'
import { data } from '../../fixtures/fedex-shipping-fixtures/shippingRatePayload.json'
import {
  loadCalculateShippingAPI,
  validateCalculateShipping,
} from '../../support/fedex-shipping/api_testcase.js'

const prefix = `UnHide sla`

describe('FedEx UnHide sla scenarios', () => {
  loginViaCookies()

  it(`${prefix} - Unhide all sla's`, updateRetry(3), () => {
    cy.hideSla(false).then((sla) => {
      graphql(
        FEDEX_SHIPPING_APP,
        saveAppSetting(appSetting, sla),
        validateSaveAppSettingResponse
      )
    })
  })

  it(`${prefix} - Calculate shipping price`, updateRetry(2), () => {
    loadCalculateShippingAPI(data, validateCalculateShipping)
  })
})
