export default {
  appSetting: {
    userCredentialKey: Cypress.env().base.fedex.userCredentialKey,
    userCredentialPassword: Cypress.env().base.fedex.userCredentialPassword,
    parentCredentialKey: '',
    parentCredentialPassword: '',
    clientDetailMeterNumber: Cypress.env().base.fedex.clientDetailMeterNumber,
    clientDetailAccountNumber:
      Cypress.env().base.fedex.clientDetailAccountNumber,
    isLive: false,
    residential: true,
    optimizeShippingType: 0,
    unitWeight: 'KG',
    unitDimension: 'CM',
    packingAccessKey: '',
    defaultDeliveryEstimateInDays: '0',
  },
  smartPackingAccessKey: 'fedexdev',
  docks: {
    fedexUSDock: {
      id: 'FD',
      name: 'Fedex US Dock',
      shippingRatesProviders: ['vtexus.fedex-shipping'],
    },
    fedexBrazilDock: {
      id: 'S0001-E0001-Dock',
      name: 'Fedex Italy Dock',
      shippingRatesProviders: ['vtexus.fedex-shipping'],
    },
    fedexKuwaitDock: {
      id: 'KUWA0112233',
      name: 'Fedex Kuwait Dock',
      shippingRatesProviders: ['vtexus.fedex-shipping'],
    },
    fedexIndiaDock: {
      id: 'IND00112233',
      name: 'Fedex India Dock',
      shippingRatesProviders: ['vtexus.fedex-shipping'],
    },
  },
  warehouseId: 'Fedex_WareHouse',
  Apache2020SkuId: '880330',
  Amacsa2020SkuId: '880350',
  singleProduct: {
    prefix: 'Single Product',
    postalCode: '33180',
  },
  multiProduct: {
    prefix: 'Multi Product',
    postalCode: '33180',
  },
}
