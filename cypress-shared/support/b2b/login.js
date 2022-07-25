import { getAccessToken } from '../extract.js'
import selectors from '../common/selectors.js'

export function visitHomePage() {
  cy.getVtexItems().then((vtex) => {
    cy.url().then((url) => {
      if (url.includes('blank') || url !== vtex.baseUrl) {
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

export function storeUserCookie(email) {
  cy.getVtexItems().then((vtex) => {
    cy.getCookie(`${vtex.authCookieName}_${vtex.account}`).then((cookie) => {
      cy.setOrganizationItem(email, cookie.value)
    })
  })
}

export function loginToStoreFront(email, role, gmailCreds) {
  it(
    `Logging in to storefront as ${role}`,
    { defaultCommandTimeout: 70000 },
    () => {
      cy.getOrganizationItems().then((organization) => {
        if (organization[email]) {
          cy.log('Logging with saved cookies')
          cy.log(email)
          // If we already logged in to this user in previous testcase, then use that cookie to re-login
          loginWithCookiesStoredInJSON(organization[email])
        } else {
          visitHomePage()
          cy.get('body').then(async ($body) => {
            if ($body.find(selectors.SignInBtn).length) {
              const accessToken = await getAccessToken(email, gmailCreds)

              cy.intercept('POST', '**/startlogin').as('startlogin')
              cy.intercept('POST', '**/accesskey/send').as('send')

              cy.get(selectors.SignInBtn).should('be.visible').click()
              cy.get(selectors.AccessCode).should('be.visible').click()
              cy.get(selectors.Email)
                .should('be.visible')
                .focus()
                .clear()
                .type(email)

              cy.get(selectors.Submit)
                .click()
                .then(async () => {
                  cy.wait('@startlogin')
                    .its('response.statusCode')
                    .should('eq', 200)
                  cy.wait('@send').its('response.statusCode').should('eq', 200)
                  const newAccessToken = await getAccessToken(
                    email,
                    gmailCreds,
                    accessToken
                  )

                  cy.get(selectors.Token).clear().type(newAccessToken)
                  cy.get(selectors.Submit).click()
                  cy.waitForSession()
                  cy.get(selectors.ProfileLabel).should('be.visible')
                  storeUserCookie(email)
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
