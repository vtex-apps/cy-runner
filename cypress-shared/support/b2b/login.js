import { getAccessToken } from '../extract.js'
import selectors from '../common/selectors.js'

export function visitHomePage() {
  cy.getVtexItems().then((vtex) => {
    cy.url().then((url) => {
      if (url.includes('blank') || url !== `${vtex.baseUrl}/`) {
        cy.intercept('POST', 'https://rc.vtex.com.br/api/events').as('EVENTS')
        cy.qe(
          'Visit home page/storefront and wait for EVENTS api to get called'
        )
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
      cy.qe('Store the userAuthCookie in organization.json')
      cy.setOrganizationItem(email, cookie.value)
    })
  })
}

export function loginToStoreFront({ email, gmailCreds }, role) {
  it(
    `Logging in to storefront with ${email} as ${role}`,
    { defaultCommandTimeout: 80000, retries: 1 },
    () => {
      cy.qe(`Logging in to storefront as ${role}`)
      cy.addDelayBetweenRetries(10000)
      cy.getOrganizationItems().then((organization) => {
        if (organization[email]) {
          cy.qe(`For this email ${email}, Logging in with saved cookies`)
          cy.log(email)
          // If we already logged in to this user in previous testcase, then use that cookie to re-login
          loginWithCookiesStoredInJSON(organization[email])
        } else {
          let currentAccessToken

          visitHomePage()

          cy.get('body').then(async ($body) => {
            if ($body.find(selectors.ProfileLabel).length) {
              cy.qe('Already logged in')
            } else if ($body.find(selectors.SignInBtn).length) {
              if (!$body.find(selectors.Token).length) {
                currentAccessToken = await getAccessToken(
                  email,
                  gmailCreds,
                  2,
                  null
                )
                cy.intercept('POST', '**/startlogin').as('startlogin')
                cy.intercept('POST', '**/accesskey/send').as('send')
                cy.qe('SignInBtn should be visible and click it')
                cy.get(selectors.SignInBtn).should('be.visible').click()
                cy.qe('AccessCode Btn should be visible and click it')
                cy.get(selectors.AccessCode).should('be.visible').click()
                cy.qe(`Type ${email} in Email field`)
                cy.get(selectors.Email)
                  .should('be.visible')
                  .focus()
                  .clear()
                  .type(email)
                cy.qe(`Click submit btn`)
                cy.get(selectors.Submit)
                  .click()
                  .then(async () => {
                    cy.wait('@startlogin')
                      .its('response.statusCode')
                      .should('eq', 200)
                    cy.qe('Wait for startLogin and send API')
                    cy.wait('@send')
                      .its('response.statusCode')
                      .should('eq', 200)
                  })
              }

              cy.get(selectors.Token)
                .should('be.visible')
                .then(async () => {
                  const newAccessToken = await getAccessToken(
                    email,
                    gmailCreds,
                    10,
                    currentAccessToken
                  )

                  cy.qe(`Type ${newAccessToken} in token field`)
                  cy.get(selectors.Token).clear().type(newAccessToken)
                  cy.get(selectors.Token).then
                  cy.qe(`Click Submit Btn`)
                  cy.get(selectors.Submit).click()
                  cy.waitForSession()
                  cy.qe(`Wait for profileLabel to be visible in the page`)
                  cy.get(selectors.ProfileLabel).should('be.visible')
                  storeUserCookie(email)
                })
            } else {
              cy.qe('SignInBtn is not found in the page')
              throw new Error('Selectors not loaded within time period')
            }
          })
        }
      })
    }
  )
}
