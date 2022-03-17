export default {
  invoiceAPI: (baseUrl) => {
    return `${baseUrl}/api/oms/pvt/orders`
  },
  workFlowAPI: (baseUrl, orderId) => {
    return `${baseUrl}/api/oms/pvt/orders/${orderId}/workflow`
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
  ADMIN_LOGIN: (apiKey, apiToken) => {
    return `https://vtexid.vtex.com.br/api/vtexid/pub/authenticate/default?user=${apiKey}&pass=${apiToken}`
  },
  affiliationAPI: (id = null) => {
    const url = 'https://productusqa.myvtex.com/api/payments/pvt/affiliations'

    if (id) return `${url}/${id}`

    return url
  },
}
