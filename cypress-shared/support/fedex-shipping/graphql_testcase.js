/* 
vtexus.fedex-shipping and vtex.packing-optimization uses same graphql name
eg: getAppSettings(), saveAppSetting()

If we run getAppSettings() or saveAppSetting(). It throws Error
Invalid GraphQL query. Multiple app dependencies have defined \"getAppSettings\". 
To fix this ambiguity you can use the @context directive to specify the app you need this data from


To solve this error use @context(provider: "vtexus.fedex-shipping")
*/

export function getAppSettings() {
  cy.qe('Get app settings via graphql')
  const query =
    'query' +
    '{ getAppSettings @context(provider: "vtexus.fedex-shipping")' +
    '{defaultDeliveryEstimateInDays,userCredentialKey,userCredentialPassword,parentCredentialKey,parentCredentialPassword,clientDetailAccountNumber,clientDetailMeterNumber,isLive,residential,optimizeShippingType,unitWeight,unitDimension,packingAccessKey,slaSettings{sla,hidden,surchargePercent,surchargeFlatRate}}}'

  return {
    query,
  }
}

export function getDocks() {
  const query =
    'query' + '{  getDocks{docksList{id,name,shippingRatesProviders}}}'

  cy.qe('Get Docks via graphQl')

  return {
    query,
    queryVariables: { id: 2 },
  }
}

export function saveAppSetting(appDatas, allSla) {
  if (allSla) {
    appDatas.slaSettings = allSla
  }

  cy.qe('Save App setting via graphql.')

  const query =
    'mutation' +
    '($userCredentialKey: String, $userCredentialPassword: String, $defaultDeliveryEstimateInDays: String, $parentCredentialKey: String, $parentCredentialPassword: String, $clientDetailMeterNumber: String, $clientDetailAccountNumber: String, $isLive: Boolean, $residential: Boolean,$optimizeShippingType: Int,$unitWeight: String,$unitDimension: String,$packingAccessKey: String,$slaSettings:[SlaSettingsInput])' +
    '{saveAppSetting(appSetting: {userCredentialKey:$userCredentialKey,userCredentialPassword:$userCredentialPassword,defaultDeliveryEstimateInDays:$defaultDeliveryEstimateInDays,parentCredentialKey:$parentCredentialKey,parentCredentialPassword:$parentCredentialPassword,clientDetailMeterNumber:$clientDetailMeterNumber,clientDetailAccountNumber:$clientDetailAccountNumber,isLive:$isLive,residential:$residential,optimizeShippingType:$optimizeShippingType,unitWeight:$unitWeight,unitDimension:$unitDimension,packingAccessKey:$packingAccessKey,slaSettings:$slaSettings})' +
    '@context(provider: "vtexus.fedex-shipping")}'

  cy.addGraphqlLogs(query, appDatas)

  return {
    query,
    queryVariables: appDatas,
  }
}

export function savePackingOptimizationAppSetting(settings) {
  cy.qe('Save packing optimization app settings via graphql.')

  const query =
    'mutation' +
    '($accessKey: String, $containerList: [ContainerInput])' +
    '{saveAppSetting(appSetting: {accessKey:$accessKey,containerList:$containerList})' +
    '@context(provider: "vtex.packing-optimization")}'

  cy.addGraphqlLogs(query, settings)

  return {
    query,
    queryVariables: settings,
  }
}

export function updateDockConnection(id, remove = false) {
  const queryVariables = { dockId: id, toRemove: remove }

  cy.qe('Update dock connection via graphQl.')

  const query =
    'mutation' +
    '($dockId: String, $toRemove: Boolean)' +
    '{updateDockConnection(updateDock: {dockId:$dockId,toRemove:$toRemove})}'

  cy.addGraphqlLogs(query, queryVariables)

  return {
    query,
    queryVariables,
  }
}

export function loadingDock(id) {
  cy.qe('Load a docks via graphql')

  const query = 'query' + '($id: ID!)' + '{loadingDock(id:$id){isActive}}'
  const queryVariables = { id }

  return {
    query,
    queryVariables,
  }
}

export function validateGetAppSettingsResponse(response) {
  expect(response.body.data.getAppSettings).to.not.equal(null)
}

export function validateGetDockConnectionResponse(response) {
  const { docksList } = response.body.data.getDocks

  expect(docksList).to.be.an('array').and.to.have.lengthOf.above(0)
  const results = docksList.filter(
    ({ shippingRatesProviders, name }) =>
      shippingRatesProviders.length > 1 && name.includes('Fedex')
  )

  expect(results.length).to.equal(4)
}

export function validateSaveAppSettingResponse(response) {
  expect(response.body.data.saveAppSetting).to.equal(true)
}

export function validateUpdateDockConnectionResponse(response) {
  expect(response.body.data.updateDockConnection).to.equal(true)
}

export function verifyInventoryIsUnlimitedForFedexWareHouse(warehouseId, sku) {
  cy.qe(
    'Verifying Inventory is unlimited via graphql.The graphQl query is,query($sku: ID!, $warehouseId: ID!){inventoryProduct(sku:$sku,warehouseId:$warehouseId){unlimited}}'
  )
  const query =
    'query' +
    '($sku: ID!, $warehouseId: ID!)' +
    '{inventoryProduct(sku:$sku,warehouseId:$warehouseId){unlimited}}'

  const queryVariables = { sku, warehouseId }

  return {
    query,
    queryVariables,
  }
}

export function validateInventory(response) {
  expect(response.body.data.inventoryProduct.unlimited).to.equal(true)
}

export function verifyDockisActive(response) {
  expect(response.body.data.loadingDock.isActive).to.equal(true)
}

export function warehouse(id) {
  cy.qe('Verify warehouse is active via graphQl')

  const query =
    'query' +
    '($id: ID!)' +
    '{warehouse(id:$id){isActive,warehouseDocks{dockId}}}'

  const queryVariables = { id }

  return {
    query,
    queryVariables,
  }
}

export function validateWareHouseIsActiveAndLinkedWithDocks(
  response,
  dockValues
) {
  const { isActive, warehouseDocks } = response.body.data.warehouse

  expect(isActive).to.equal(true)
  const [actualDockId1, actualDockId2, actualDockId3, actualDockId4] = [
    warehouseDocks[0].dockId,
    warehouseDocks[1].dockId,
    warehouseDocks[2].dockId,
    warehouseDocks[3].dockId,
  ]

  const [expectedDockId1, expectedDockId2, expectedDockId3, expectedDockId4] = [
    dockValues[0].id,
    dockValues[1].id,
    dockValues[2].id,
    dockValues[3].id,
  ]

  expect(actualDockId1).to.equal(expectedDockId1)
  expect(actualDockId2).to.equal(expectedDockId2)
  expect(actualDockId3).to.equal(expectedDockId3)
  expect(actualDockId4).to.equal(expectedDockId4)
}
