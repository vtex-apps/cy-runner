/* eslint-disable func-names */
/* eslint-disable no-console */

const axios = require('axios')
const qs = require('qs')

async function getHeaders(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${await accessToken}`,
    },
  }
}

class GmailAPI {
  constructor(obj) {
    this.accessToken = this.getAcceToken(obj)
  }

  async getAcceToken({ clientId, clientSecret, refreshToken }) {
    const data = qs.stringify({
      clientId,
      clientSecret,
      refreshToken,
      grant_type: 'refresh_token',
    })

    const config = {
      method: 'post',
      url: 'https://accounts.google.com/o/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    }

    let accessToken = ''

    await axios(config)
      .then(async function (response) {
        accessToken = await response.data.access_token
      })
      .catch(function () {
        throw new Error(
          'Some of the keys (id, clientId, clientSecret, refreshToken) are invalid'
        )
      })

    return accessToken
  }

  async searchGmail(searchItem) {
    const config1 = {
      method: 'get',
      url: `https://www.googleapis.com/gmail/v1/users/me/messages?q=${searchItem}`,
      ...(await getHeaders(this.accessToken)),
    }

    let threadId = ''

    await axios(config1)
      .then(async function (response) {
        threadId = await response.data.messages[0].id
      })
      .catch(function (error) {
        console.log('SearchGmail', error)
      })

    return threadId
  }

  async readGmailContent(messageId) {
    const config = {
      method: 'get',
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      ...(await getHeaders(this.accessToken)),
    }

    let data = {}

    await axios(config)
      .then(async function (response) {
        data = await response.data
      })
      .catch(function (error) {
        console.log('ReadGmailContent', error)
      })

    return data
  }

  async readInboxContent(searchText) {
    const threadId = await this.searchGmail(searchText)
    const message = await this.readGmailContent(threadId)

    let encodedMessage = await message.payload?.parts
    let decodedStr = null

    if (encodedMessage) {
      encodedMessage = encodedMessage[0].body.data
      decodedStr = Buffer.from(encodedMessage, 'base64').toString('ascii')
    }

    return decodedStr
  }
}

module.exports = GmailAPI
