const GmailAPI = require('./common/gmail')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function extractAccessCode(message) {
  if (message) {
    const regex = /<strong>(\d.*)<\/strong>/

    return message.includes('access code') ? message.match(regex)[1] : '0'
  }

  return '0'
}

export async function getAccessToken(email, gmailCreds, accessToken = null) {
  const gmail = new GmailAPI(gmailCreds)
  const ToEmail = email.replace('+', '%2B')
  let currentAccessToken
  const totalRetry = 8

  await gmail.getAcceToken(gmailCreds)

  /* eslint-disable no-await-in-loop */
  for (let currentRetry = 0; currentRetry <= totalRetry; currentRetry++) {
    currentAccessToken = extractAccessCode(
      await gmail.readInboxContent(
        new URLSearchParams(
          `from:noreply@vtexcommerce.com.br+to:${ToEmail}`
        ).toString(),
        gmailCreds
      )
    )
    if (accessToken === null || currentAccessToken !== accessToken) {
      return currentAccessToken
    }

    await delay(5500)
  }
}
