/* eslint-disable jest/expect-expect */
import {
  updateRetry,
  loginViaCookies,
  preserveCookie,
} from '../../support/common/support'
import {
  graphql,
  getAppSettings,
  validateGetAppSettingsResponse,
  getDocks,
  validateGetDockConnectionResponse,
  saveAppSetting,
  validateSaveAppSettingResponse,
  updateDockConnection,
  validateUpdateDockConnectionResponse,
  verifyInventoryIsUnlimitedForFedexWareHouse,
  validateInventory,
  loadingDock,
  verifyDockisActive,
  warehouse,
  validateWareHouseIsActiveAndLinkedWithDocks,
} from '../../support/fedex-shipping/graphql_testcase'
import {
  appSetting,
  docks,
  warehouseId,
  Apache2020SkuId,
  Amacsa2020SkuId,
} from '../../support/fedex-shipping/outputvalidation'
import {
  FEDEX_SHIPPING_APP,
  INVENTORY_GRAPHQL_APP,
  LOGISTICS_CARRIER_GRAPHQL_APP,
} from '../../support/fedex-shipping/graphql_apps'

const prefix = 'Graphql testcase'

describe('FedEx GraphQL Validation', () => {
  loginViaCookies()

  it(`${prefix} - Get App Settings`, updateRetry(2), () => {
    cy.visit('/')
    graphql(FEDEX_SHIPPING_APP, getAppSettings(), (response) => {
      validateGetAppSettingsResponse(response)
      cy.setAppSettingstoJSON('config', response.body)
    })
  })

  it(`${prefix} - save App Settings`, updateRetry(2), () => {
    graphql(
      FEDEX_SHIPPING_APP,
      saveAppSetting(appSetting),
      validateSaveAppSettingResponse
    )
  })

  it('Get userAuthCookie and set cookie', updateRetry(2), () => {
    cy.getVtexItems().then((vtex) => {
      const cookieName = vtex.userAuthCookieName

      cy.getCookie(cookieName).then(({ value }) => {
        cy.setAppSettingstoJSON(cookieName, value)
      })
    })
  })

  it(`${prefix} - Update Dock Connection`, updateRetry(2), () => {
    for (const { id } of Object.values(docks)) {
      graphql(
        FEDEX_SHIPPING_APP,
        updateDockConnection(id, false),
        validateUpdateDockConnectionResponse
      )
    }
  })

  it(`${prefix} - Get Docks`, updateRetry(2), () => {
    graphql(
      FEDEX_SHIPPING_APP,
      getDocks(),
      validateGetDockConnectionResponse,
      Object.values(docks)
    )
  })

  it(`Verify by UI - Test Credentials`, () => {
    cy.visit('/admin/app/fedex-shipping')
    cy.get('#meter').should('be.visible').should('not.have.value', '')
    cy.contains('Test Credentials').should('be.visible').click()
    cy.contains('Success')
  })

  it(`${prefix} - For fedex docks, verify inventory is set to infinite`, () => {
    graphql(
      INVENTORY_GRAPHQL_APP,
      verifyInventoryIsUnlimitedForFedexWareHouse(warehouseId, Apache2020SkuId),
      validateInventory
    )
    graphql(
      INVENTORY_GRAPHQL_APP,
      verifyInventoryIsUnlimitedForFedexWareHouse(warehouseId, Amacsa2020SkuId),
      validateInventory
    )
  })

  it(`${prefix} - Fedex docks should be active`, () => {
    for (const { id } of Object.values(docks)) {
      graphql(
        LOGISTICS_CARRIER_GRAPHQL_APP,
        loadingDock(id),
        verifyDockisActive
      )
    }
  })

  it(`${prefix} - Fedex warehouse should be active and linked with fedex docks`, () => {
    graphql(
      LOGISTICS_CARRIER_GRAPHQL_APP,
      warehouse(warehouseId),
      validateWareHouseIsActiveAndLinkedWithDocks,
      Object.values(docks)
    )
  })

  preserveCookie()
})
