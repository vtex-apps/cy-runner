import selectors from './selectors.js'
import { addressList, AUTH_COOKIE_NAME_ENV } from './constants.js'
import { AdminLogin } from './apis.js'
import {
  generateAddtoCartSelector,
  generateAddtoCartCardSelector,
} from './utils.js'

export function scroll() {
  // So, scroll first then look for selectors
  cy.scrollTo(0, 1000)
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000)
  cy.scrollTo(0, -100)
}

function setAuthCookie(authResponse) {
  expect(authResponse.body).to.have.property('authCookie')
  // Set AUTH_COOKIE
  Cypress.env(AUTH_COOKIE_NAME_ENV, authResponse.body.authCookie.Name)
  cy.setCookie(
    authResponse.body.authCookie.Name,
    authResponse.body.authCookie.Value,
    { log: false }
  )
}

// Set Product Quantity
function setProductQuantity({ position, quantity, timeout }, subTotal, check) {
  cy.intercept('**/update').as('update')

  cy.get(selectors.ProductQuantityInCheckout(position), { timeout: 15000 })
    .should('be.visible')
    .should('not.be.disabled')
    .focus()
    .type(`{backspace}${quantity}{enter}`)
  cy.get(selectors.ItemRemove(position), { timeout: 15000 }).should(
    'not.have.css',
    'display',
    'none'
  )

  cy.wait('@update', { timeout })

  if (check) {
    cy.get(selectors.SubTotal, { timeout }).should('have.text', subTotal)
  }
}

function clickProceedtoCheckout() {
  // Click Proceed to Checkout button
  cy.get(selectors.ProceedtoCheckout).should('be.visible').click()
  cy.get(selectors.CartTimeline, { timeout: 30000 })
    .should('be.visible')
    .click({ force: true })
}

// Add product to cart
export function addProduct(
  searchKey,
  { proceedtoCheckout = true, paypal = false, productDetailPage = false } = {}
) {
  // Add product to cart
  cy.get(selectors.searchResult).should('have.text', searchKey.toLowerCase())
  cy.get(selectors.ProductAnchorElement)
    .should('have.attr', 'href')
    .then((href) => {
      cy.get(selectors.ProfileLabel)
        .should('be.visible')
        .should('have.contain', `Hello,`)
      cy.get(selectors.BrandFilter).should('not.be.disabled')
      if (productDetailPage) {
        cy.get(generateAddtoCartCardSelector(href)).first().click()
        cy.get('[name=postalCode]').clear().type('33180').type('{enter}')
        cy.get(selectors.ProductsQAShipping).click()
        // Make sure proceed to payment is visible
        cy.get(selectors.AddtoCart).should('be.visible').click()
      } else {
        cy.get(generateAddtoCartSelector(href)).first().click()
        // Make sure proceed to payment is visible
        cy.get(selectors.ProceedtoCheckout).should('be.visible')
      }

      // Make sure shipping and taxes is visible
      cy.get(selectors.SummaryText).should('have.contain', 'Shipping and taxes')
      // Make sure remove button is visible
      cy.get(selectors.RemoveProduct).should('be.visible')
      cy.get('#items-price div[class*=price]').should('have.contain', '$')
      if (paypal) {
        cy.get(selectors.ProceedtoCheckout).should('be.visible').click()
        cy.get(selectors.ItemQuantity).should('be.visible')
        if (proceedtoCheckout) {
          clickProceedtoCheckout()
        }
      } else if (proceedtoCheckout) {
        clickProceedtoCheckout()
      } else {
        cy.closeCart()
      }
    })
}

// Buy Product
export function buyProduct() {
  // Click Buy Product
  cy.get(selectors.BuyNowBtn).last().click()
}

// Close Cart
export function closeCart() {
  cy.get(selectors.CloseCart).click()
}

export function fillAddress(postalCode) {
  const { fullAddress, country } = addressList[postalCode]

  cy.get(selectors.FirstName).then(($el) => {
    if (Cypress.dom.isVisible($el)) {
      return cy.wrap(true)
    }

    cy.get('body').then(($body) => {
      if ($body.find(selectors.ShippingPreview).length) {
        // shipping preview should be visible
        cy.get(selectors.ShippingPreview).should('be.visible')
      }

      cy.get(selectors.ShipCountry, { timeout: 5000 })
        .should('not.be.disabled')
        .select('USA')
        .select(country)

      if ($body.find(selectors.ShipAddressQuery).length) {
        // Type shipping address query
        // Google autocompletion takes some seconds to show dropdown
        // So, we use 500 seconds wait before and after typing of address
        cy.get(selectors.ShipAddressQuery)
          .should('not.be.disabled')
          .focus()
          .clear()

        cy.get(selectors.ShipAddressQuery) // eslint-disable-line cypress/no-unnecessary-waiting
          .click()
          .type(`${fullAddress}`, { delay: 80 })
          .wait(500)
          .type('{downarrow}{enter}')

        return cy.wrap(false)
      }

      cy.get(selectors.PostalCodeInput, { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(postalCode)

      return cy.wrap(true)
    })
  })
}

function fillAddressLine1(deliveryScreenAddress) {
  cy.get('body').then(($shippingBlock) => {
    if ($shippingBlock.find(selectors.ShipStreet).length) {
      cy.get(selectors.ShipStreet).clear().type(deliveryScreenAddress)
      cy.get(selectors.GotoPaymentBtn).should('be.visible').click()
    }
  })
}

function startShipping() {
  cy.get('body').then(($body) => {
    if ($body.find(selectors.ShippingCalculateLink).length) {
      // Contact information needs to be filled
      cy.get(selectors.ShippingCalculateLink).should('be.visible').click()
    } else if ($body.find(selectors.DeliveryAddress).length) {
      // Contact Information already filled
      cy.get(selectors.DeliveryAddress).then(($el) => {
        if (Cypress.dom.isVisible($el)) {
          cy.get(selectors.DeliveryAddress).should('be.visible').click()
        }
      })
    }
  })
}

export function fillContactInfo(shippingStrategySelector) {
  cy.get(selectors.QuantityBadge).should('be.visible')
  cy.get(selectors.SummaryCart).should('be.visible')
  cy.get(selectors.FirstName).clear().type('Syed', {
    delay: 50,
  })
  cy.get(selectors.LastName).clear().type('Mujeeb', {
    delay: 50,
  })
  cy.get(selectors.Phone).clear().type('(304) 123 4556', {
    delay: 50,
  })
  cy.get(selectors.ProceedtoShipping).should('be.visible').click()
  cy.get(selectors.ProceedtoShipping, { timeout: 1000 }).should(
    'not.be.visible'
  )
  cy.get('body').then(($shippingBlock) => {
    if ($shippingBlock.find(selectors.ReceiverName).length) {
      cy.get(selectors.ReceiverName, { timeout: 5000 }).type('Syed', {
        delay: 50,
      })
      shippingStrategySelector &&
        cy.get(shippingStrategySelector).should('be.visible').click()
      cy.get(selectors.GotoPaymentBtn).should('be.visible').click()
    } else {
      cy.log('Shipping block is not shown! May be ReceiverName already filled')
    }
  })
}

export function updateShippingInformation({
  postalCode,
  pickup = false,
  invalid = false,
  timeout = 5000,
  shippingStrategySelector = null,
}) {
  const { deliveryScreenAddress } = addressList[postalCode]

  startShipping()
  cy.intercept('https://rc.vtex.com/v8').as('v8')
  cy.intercept('**/shippingData').as('shippingData')
  cy.fillAddress(postalCode).then(() => {
    if (invalid) {
      cy.get(selectors.DeliveryUnavailable, { timeout }).contains(
        'cannot be shipped to the given address.'
      )
      cy.get(selectors.DeliveryAddressText, { timeout }).click()
    } else if (pickup) {
      cy.wait('@shippingData')
      cy.get(selectors.PickupInStore, { timeout }).should('be.visible').click()
      cy.get(selectors.PickupItems, { timeout })
        .should('be.visible')
        .contains('Pickup')
      cy.get(selectors.ProceedtoPaymentBtn).should('be.visible').click()
    } else {
      cy.get(selectors.CartTimeline).should('be.visible').click({ force: true })
      cy.get(selectors.DeliveryAddressText, { timeout })
        .invoke('text')
        .should(
          'match',
          new RegExp(`^${deliveryScreenAddress}$|^${postalCode}$`, 'gi')
        )
      cy.get(selectors.ProceedtoPaymentBtn).should('be.visible').click()
    }

    cy.get(selectors.FirstName).then(($el) => {
      if (Cypress.dom.isVisible($el)) {
        cy.wait('@v8')
        fillContactInfo(shippingStrategySelector)
      }
    })

    fillAddressLine1(deliveryScreenAddress)
  })
}

export function updateProductQuantity(
  product,
  {
    quantity = '1',
    multiProduct = false,
    verifySubTotal = true,
    timeout = 5000,
  } = {}
) {
  cy.get(selectors.CartTimeline).should('be.visible').click({ force: true })
  if (multiProduct) {
    // Set First product quantity and don't verify subtotal because we passed false
    setProductQuantity(
      { position: 1, quantity, timeout },
      product.subTotal,
      false
    )
    // if multiProduct is true, then remove the set quantity and verify subtotal for multiProduct
    // Set second product quantity and verify subtotal
    setProductQuantity(
      { position: 2, quantity: 1, timeout },
      product.subTotal,
      verifySubTotal
    )
  } else {
    // Set First product quantity and verify subtotal
    setProductQuantity(
      { position: 1, quantity, timeout },
      product.subTotal,
      verifySubTotal
    )
  }
}

// LoginAsAdmin via API
export function loginAsAdmin() {
  // Get Vtex Iems
  cy.getVtexItems().then((vtex) => {
    cy.request(`${vtex.authUrl}/start`).then((response) => {
      expect(response.body).to.have.property('authenticationToken')
      cy.request({
        method: 'GET',
        url: AdminLogin(vtex.apiKey, vtex.apiToken),
      }).then((authResponse) => {
        setAuthCookie(authResponse)
      })
    })
  })
}

// LoginAsUser via API
export function loginAsUser(email, password) {
  // Get Vtex Iems
  cy.getVtexItems().then((vtex) => {
    let authenticationToken = null

    cy.request({
      method: 'POST',
      url: `${vtex.authUrl}/startlogin`,
      form: true,
      body: {
        accountName: vtex.account,
        scope: vtex.account,
        returnUrl: vtex.baseUrl,
        callbackUrl: `${vtex.baseUrl}/api/vtexid/oauth/finish?popup=false`,
        user: email,
      },
    }).then((response) => {
      authenticationToken = response.headers['set-cookie'][0]
        .split(';')[0]
        .split('=')
        .pop()

      cy.request({
        method: 'POST',
        url: `${vtex.authUrl}/classic/validate`,
        form: true,
        body: {
          login: email,
          password,
          authenticationToken,
        },
      }).then((authResponse) => {
        setAuthCookie(authResponse)
      })
    })
  })
}

export function net30Payment() {
  cy.promissoryPayment()
  cy.buyProduct()
}

export function saveOrderId(orderIdEnv = false, externalSeller = false) {
  // This page take longer time to load. So, wait for profile icon to visible then get orderid from url
  cy.get(selectors.Search, { timeout: 30000 })
  cy.url().then((url) => {
    const orderId = `${url.split('=').pop()}-01`

    // If we are ordering product
    // then store orderId in .orders.json
    if (orderIdEnv) {
      cy.setOrderItem(orderIdEnv, orderId)
    }

    if (externalSeller) {
      cy.setOrderItem(externalSeller.directSaleEnv, orderId)
      cy.setOrderItem(
        externalSeller.externalSaleEnv,
        `${orderId.slice(0, -1)}2`
      )
    }
  })
}

// Do promissory payment
export function promissoryPayment() {
  cy.get(selectors.PromissoryPayment).click()
}

// Search Product
export function searchProduct(searchKey) {
  cy.intercept('**/rc.vtex.com.br/api/events').as('events')
  cy.visit('/')
  cy.wait('@events')
  cy.get('body').should('contain', 'Hello')
  // Search product in search bar
  cy.get(selectors.Search)
    .should('be.visible')
    .clear()
    .type(searchKey)
    .type('{enter}')
  // Page should load successfully now searchResult & Filter should be visible
  cy.get(selectors.searchResult)
    .should('be.visible')
    .should('have.text', searchKey.toLowerCase())
  cy.get(selectors.FilterHeading).should('be.visible')
}

export function stopTestCaseOnFailure() {
  // Arrow function doesn't provide us a way to use this.currentTest
  // So, we are using normal function
  // eslint-disable-next-line func-names
  afterEach(function () {
    if (
      this.currentTest.currentRetry() === this.currentTest.retries() &&
      this.currentTest.state === 'failed'
    ) {
      Cypress.runner.stop()
    }
  })
}

/* Test Setup - Use Cookies to Login
   before()
     a) Inject Authentication cookie
  afterEach()
     a) Stop Execution if testcase gets failed in all retries
*/

export function testSetup(storeFrontCookie = true, stop = true) {
  before(() => {
    // Inject cookies
    cy.getVtexItems().then((vtex) => {
      cy.setCookie(vtex.authCookieName, vtex.adminAuthCookieValue, {
        log: false,
      })
      if (storeFrontCookie) {
        cy.setCookie(
          `${vtex.authCookieName}_${vtex.account}`,
          vtex.userAuthCookieValue,
          {
            log: false,
          }
        )
      }
    })
  })
  if (stop) stopTestCaseOnFailure()
}

/* Test Setup - Use API for login
   before()
     a) Inject Authentication cookie
  afterEach()
     a) Stop Execution if testcase gets failed in all retries
*/

export function testSetup2(stop = true) {
  before(() => {
    // LoginAsAdmin
    loginAsAdmin()
    // LoginAsUser and visit home page
    cy.getVtexItems().then((vtex) => {
      loginAsUser(vtex.robotMail, vtex.robotPassword)
    })
  })
  if (stop) stopTestCaseOnFailure()
}

export function preserveCookie() {
  afterEach(() => {
    // Code to Handle the Sesssions in cypress.
    // Keep the Session alive when you jump to another test
    cy.getCookies().then((cookies) => {
      const namesOfCookies = cookies.map((c) => c.name)

      Cypress.Cookies.preserveOnce(...namesOfCookies)
    })
  })
}

export function updateRetry(retry) {
  return { retries: retry }
}

// Verify Total by adding amounts in shipping summary
export function verifyTotal(totalAmount) {
  cy.get(selectors.ShippingSummary)
    .invoke('text')
    .then((costString) => {
      const costArray = costString.split('$').slice(1)
      const total = costArray.reduce((sum, number) => {
        return sum + parseFloat(number.replace(',', ''))
      }, 0)

      cy.get(selectors.TotalLabel)
        .first()
        .invoke('text')
        .then((totalText) => {
          expect(totalText.replace(',', '').replace('$ ', '')).to.equal(
            (total / 2).toFixed(2).replace(',', '')
          )
          expect(totalText).to.equal(totalAmount)
        })
    })
}
