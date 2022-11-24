import {
  graphql,
  saveAppSetting,
  validateSaveAppSettingResponse,
} from './graphql_testcase'
import { FEDEX_SHIPPING_APP } from './graphql_apps.js'

export function updateSLASettings(appSetting, rate = 0, percentage = 0) {
  cy.readFile('.fedexPayload.json').then((items) => {
    const { slaSettings } = items.data.getAppSettings

    for (const ship in slaSettings) {
      slaSettings[ship].surchargeFlatRate = rate
      slaSettings[ship].surchargePercent = percentage
    }

    graphql(
      FEDEX_SHIPPING_APP,
      saveAppSetting(appSetting, slaSettings),
      validateSaveAppSettingResponse
    )
  })
}
