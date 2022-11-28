export default {
  invoiceAPI: (baseUrl) => {
    return `${baseUrl}/api/oms/pvt/orders`
  },
  workFlowAPI: (baseUrl, orderId) => {
    return `${baseUrl}/api/oms/pvt/orders/${orderId}/workflow`
  },
  getOrderAPI: (baseUrl, orderId) => {
    return `${baseUrl}/api/oms/pvt/orders/${orderId}`
  },
  startHandlingAPI: (baseUrl, orderId) => {
    return `${baseUrl}/api/oms/pvt/orders/${orderId}/start-handling`
  },
  cancelOrderAPI: (baseUrl, orderId) => {
    return `${baseUrl}/api/oms/pvt/orders/${orderId}/cancel`
  },
  transactionAPI: (baseUrl) => {
    return `${baseUrl}/api/payments/pvt/transactions`
  },
  AdminLogin: (apiKey, apiToken) => {
    return `https://vtexid.vtex.com.br/api/vtexid/pub/authenticate/default?user=${apiKey}&pass=${apiToken}`
  },
  affiliationAPI: (id = null) => {
    const url = 'https://productusqa.myvtex.com/api/payments/pvt/affiliations'

    if (id) return `${url}/${id}`

    return url
  },
  getPickupPoints: (baseUrl) => {
    return `${baseUrl}/api/logistics/pvt/configuration/pickuppoints`
  },
  deletePickupPoint: (baseUrl, pickupPointid) => {
    return `${baseUrl}/api/logistics/pvt/configuration/pickuppoints/${pickupPointid}`
  },
  loadDocksAPI: (baseUrl) => {
    return `${baseUrl}/admin/shipping-strategy/loading-docks/`
  },
  calculateShippingAPI: (account, workspace) => {
    return `https://app.io.vtex.com/vtexus.fedex-shipping/v1/${account}/${workspace}/shp-rates/calculate`
  },
}
