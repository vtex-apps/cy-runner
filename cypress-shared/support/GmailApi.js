const axios = require('axios')
const qs = require('qs')

async function getHeaders(accessToken) {
  return {
    Authorization: `Bearer ${await accessToken} `,
  }
}

class GmailAPI {
  accessToken = ''
  constructor(obj) {
    this.accessToken = this.getAcceToken(obj)
  }

  getAcceToken = async ({ client_id, client_secret, refresh_token }) => {
    let data = qs.stringify({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    })
    let config = {
      method: 'post',
      url: 'https://accounts.google.com/o/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    }

    let accessToken = ''

    await axios(config)
      .then(async function (response) {
        accessToken = await response.data.access_token
      })
      .catch(function (error) {
        console.log('AccessToken', error)
      })

    return accessToken
  }

  searchGmail = async (searchItem) => {
    let config1 = {
      method: 'get',
      url:
        'https://www.googleapis.com/gmail/v1/users/me/messages?q=' + searchItem,
      headers: getHeaders(this.accessToken),
    }
    let threadId = ''

    await axios(config1)
      .then(async function (response) {
        threadId = await response.data['messages'][0].id
      })
      .catch(function (error) {
        console.log('SearchGmail', error)
      })

    return threadId
  }

  readGmailContent = async (messageId) => {
    let config = {
      method: 'get',
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      headers: {
        Authorization: getHeaders(this.accessToken),
      },
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

  readInboxContent = async (searchText, gmailCreds) => {
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
