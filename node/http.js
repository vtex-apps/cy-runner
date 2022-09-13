const axios = require('axios')

const system = require('./system')

exports.request = async (axiosConfig) => {
  let response

  await axios(axiosConfig)
    .then((result) => {
      response = result
    })
    .catch((e) => {
      system.crash('Request failed', e)
    })

  return response
}

exports.runningSorryCypress = async () => {
  let response
  const axiosConfig = {
    url: 'http://localhost:1234',
    method: 'get',
  }

  await axios(axiosConfig)
    .then((result) => {
      response = result
    })
    .catch((_e) => {
      return false
    })

  return response?.status === 200
}
