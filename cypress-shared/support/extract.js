const GmailAPI = require('./common/gmail')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function extractAccessCode(message) {
  if (message) {
    const regex = /<strong>(\d.*)<\/strong>/

    return message.includes('access code') ? message.match(regex)[1] : null
  }

  return null
}

export async function getAccessToken(
  email,
  gmailCreds,
  totalRetry,
  accessToken = null
) {
  /* eslint-disable no-await-in-loop */
  const gmail = new GmailAPI(gmailCreds)

  await gmail.getAcceToken(gmailCreds)
  const ToEmail = email.replace('+', '%2B')
  let currentAccessToken = null

  for (let currentRetry = 1; currentRetry <= totalRetry; currentRetry++) {
    await delay(5500)
    currentAccessToken = extractAccessCode(
      await gmail.readInboxContent(
        new URLSearchParams(
          `from:noreply@vtexcommerce.com.br+to:${ToEmail}`
        ).toString(),
        gmailCreds
      )
    )
    if (currentAccessToken !== accessToken) {
      break
    }
  }

  return currentAccessToken
}
