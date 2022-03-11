import { getAccessToken } from './extract.js'
import selectors from '../../cypress-template/common_selectors.js'

export function loginToStoreFront(emailId, role) {
  it(
    `Logging in to storefront as ${role}`,
    { defaultCommandTimeout: 60000, retries: 3 },
    () => {
      cy.visit('/', {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      })
      cy.intercept('POST', 'https://rc.vtex.com.br/api/events').as('EVENTS')
      cy.wait('@EVENTS').then(() => {
        cy.getGmailItems().then((gmail) => {
          cy.get('body').then(async ($body) => {
            if ($body.find(selectors.SignInBtn).length) {
              const gmailCreds = {
                client_id: gmail.clientId,
                client_secret: gmail.clientSecret,
                refresh_token: gmail.refreshToken,
              }

              const accessToken = await getAccessToken(emailId, gmailCreds)

              cy.get(selectors.SignInBtn).click()
              cy.get(selectors.AccessCode).should('be.visible').click()
              cy.get(selectors.Email).should('be.visible').focus().type(emailId)
              cy.get(selectors.Submit)
                .click()
                .then(async () => {
                  const newAccessToken = await getAccessToken(
                    emailId,
                    gmailCreds,
                    accessToken
                  )

                  cy.get(selectors.Token).type(newAccessToken)
                  cy.get(selectors.Submit).click()
                  cy.waitForSession()
                  cy.get(selectors.ProfileLabel).should('be.visible')
                })
            } else if ($body.find(selectors.ProfileLabel).length) {
              cy.log('Already logged in')
            } else {
              throw new Error('Selectors not loaded within time period')
            }
          })
        })
      })
    }
  )
}
