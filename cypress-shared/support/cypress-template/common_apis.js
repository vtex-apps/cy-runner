export default {
  AdminLogin: (apiKey, apiToken) => {
    return `https://vtexid.vtex.com.br/api/vtexid/pub/authenticate/default?user=${apiKey}&pass=${apiToken}`
  },
}
