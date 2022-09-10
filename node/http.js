const axios = require('axios')

exports.request = async (axiosConfig) => {
  let response

  await axios(axiosConfig)
    .then((result) => {
      response = result
    })
    .catch((e) => {
      this.crash('Request failed', e)
    })

  return response
}
