const axios = require('axios')

exports.request = async (config) => {
  let response

  await axios(config)
    .then((result) => {
      response = result
    })
    .catch((e) => {
      this.crash('Request failed', e)
    })

  return response
}
