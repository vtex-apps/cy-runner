import { getAccessToken } from '../extract.js'
import selectors from '../common/selectors.js'

export function visitHomePage() {
  cy.url().then((url) => {
    if (url.includes('blank')) {
      cy.intercept('POST', 'https://rc.vtex.com.br/api/events').as('EVENTS')
      cy.visit('/', {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      })
      cy.wait('@EVENTS')
    } else {
      cy.log('We are already in storefront homepage')
    }
  })
}

export function loginWithCookiesStoredInJSON(cookieValue) {
  cy.getVtexItems().then((vtex) => {
    cy.setCookie(`${vtex.authCookieName}_${vtex.account}`, cookieValue, {
      log: false,
    })
  })
  visitHomePage()
  cy.waitForSession()
  cy.get(selectors.ProfileLabel).should('be.visible')
}

export function storeUserCookie(emailId) {
  cy.getVtexItems().then((vtex) => {
    cy.getCookie(`${vtex.authCookieName}_${vtex.account}`).then((cookie) => {
      cy.setOrganizationItem(emailId, cookie.value)
    })
  })
}

export function loginToStoreFront(emailId, role) {
  it.only(
    `Logging in to storefront as ${role}`,
    { defaultCommandTimeout: 70000, retries: 1 },
    () => {
      cy.getOrganizationItems().then((organization) => {
        if (organization[emailId]) {
          cy.log('Logging with saved cookies')
          cy.log(emailId)
          // If we already logged in to this user in previous testcase, then use that cookie to re-login
          loginWithCookiesStoredInJSON(organization[emailId])
        } else {
          visitHomePage()
          cy.get('body').then(async ($body) => {
            if ($body.find(selectors.SignInBtn).length) {
              cy.getGmailItems().then(async (gmail) => {
                const gmailCreds = {
                  clientId: gmail.clientId,
                  clientSecret: gmail.clientSecret,
                  refreshToken: gmail.refreshToken,
                }

                const accessToken = await getAccessToken(emailId, gmailCreds)

                cy.intercept('POST', '**/startlogin').as('startlogin')
                cy.intercept('POST', '**/accesskey/send').as('send')

                cy.get(selectors.SignInBtn).should('be.visible').click()
                cy.get(selectors.AccessCode).should('be.visible').click()
                cy.get(selectors.Email)
                  .should('be.visible')
                  .focus()
                  .clear()
                  .type(emailId)

                cy.get(selectors.Submit)
                  .click()
                  .then(async () => {
                    cy.wait('@startlogin')
                      .its('response.statusCode')
                      .should('eq', 200)
                    cy.wait('@send')
                      .its('response.statusCode')
                      .should('eq', 200)
                    const newAccessToken = await getAccessToken(
                      emailId,
                      gmailCreds,
                      accessToken
                    )

                    cy.get(selectors.Token).clear().type(newAccessToken)
                    cy.get(selectors.Submit).click()
                    cy.waitForSession()
                    cy.get(selectors.ProfileLabel).should('be.visible')
                    storeUserCookie(emailId)
                  })
              })
            } else if ($body.find(selectors.ProfileLabel).length) {
              cy.log('Already logged in')
            } else {
              throw new Error('Selectors not loaded within time period')
            }
          })
        }
      })
    }
  )
}
