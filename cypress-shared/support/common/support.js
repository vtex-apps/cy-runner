import selectors from './selectors.js'
import { addressList, AUTH_COOKIE_NAME_ENV } from './constants.js'
import { AdminLogin } from './apis.js'
import {
  generateAddtoCartSelector,
  generateAddtoCartCardSelector,
  getLogFile,
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
  cy.qe('Intercept update API')
  cy.qe(`Focus product quantity input field and update quantity as ${quantity}`)
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
  cy.qe('Wait for update API to get called')

  if (check) {
    cy.qe('verify the subTotal in the right side of the cart items')
    cy.qe(`SubTotal should be ${subTotal}`)
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
  cy.qe(`
  Verfiying the search result is visible and having the text ${searchKey} in lowercase
  Verifying the ProfileLabel should be visible and contain the text Hello
  Verifying the BrandFilter should not be disabled
  Adding product - ${searchKey} to cart
  Verify the shipping and taxes in the mini cart
  click on proceed to checkout
  `)
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
        // cy.get(selectors.ProceedtoCheckout).should('be.visible').click()
        // cy.get(selectors.ItemQuantity).should('be.visible')
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

export function fillAddress(postalCode, timeout = 5000) {
  cy.get(selectors.CartTimeline).should('be.visible').click()
  const { fullAddress, country } = addressList[postalCode]

  cy.get('body').then(($body) => {
    if ($body.find(selectors.ShippingPreview).length) {
      // shipping preview should be visible
      cy.get(selectors.ShippingPreview).should('be.visible')
      if ($body.find(selectors.DeliveryAddress).length) {
        cy.get(selectors.DeliveryAddress).should('be.visible').click()
      } else if ($body.find(selectors.ShippingCalculateLink).length) {
        cy.get(selectors.ShippingCalculateLink).should('be.visible').click()
      }
    }

    cy.get(selectors.ShipCountry, { timeout })
      .should('not.be.disabled')
      .select('USA')
      .select(country)

    cy.get('body').then(($shippingBody) => {
      if ($shippingBody.find(selectors.ShipAddressQuery).length) {
        // Type shipping address query
        // Google autocompletion takes some seconds to show dropdown
        // So, we use 500 seconds wait before and after typing of address
        cy.get(selectors.ShipAddressQuery)
          .should('not.be.disabled')
          .focus()
          .clear()

        cy.get(selectors.ShipAddressQuery) // eslint-disable-line cypress/no-unnecessary-waiting
          .click()
          .type(`     ${fullAddress}`, { delay: 150 })
          .wait(1000)
          .type('{downarrow}{enter}')
      } else {
        cy.get(selectors.PostalCodeInput, { timeout: 10000 })
          .should('be.visible')
          .clear()
          .type(postalCode)
      }
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

const PHONE_NUMBER = '(304) 123 4556'

export function fillContactInfo(
  shippingStrategySelector,
  phoneNumber,
  checkoutcustom
) {
  cy.qe('Found customer with no order history')
  phoneNumber = phoneNumber || PHONE_NUMBER
  cy.get(selectors.QuantityBadge).should('be.visible')
  cy.get(selectors.SummaryCart).should('be.visible')
  cy.qe('Verify quantityBadge and summarycart should be visible')
  // Delay in ms
  const firstName = 'Syed'
  const lastName = 'Mujeeb'

  cy.qe(`Type firstName ${firstName}`)
  cy.qe(`Type lastName ${lastName}`)
  cy.qe(`Type phone ${phoneNumber}`)

  cy.get(selectors.FirstName).clear().type(firstName, {
    delay: 50,
  })
  cy.get(selectors.LastName).clear().type(lastName, {
    delay: 50,
  })
  cy.get(selectors.Phone).clear().type(phoneNumber, {
    delay: 50,
  })

  if (checkoutcustom) {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)
  }

  cy.qe(
    'Click proceedtoShipping button and verify that button gets hidden from ui'
  )
  cy.get(selectors.ProceedtoShipping).should('be.visible').click()
  cy.get(selectors.ProceedtoShipping, { timeout: 1000 }).should(
    'not.be.visible'
  )

  if (checkoutcustom) {
    cy.qe('Wait for 5s')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)
  }

  // This block is getting visible only for checkout ui custom E2E tests
  // Screenshot: https://vtex-dev.atlassian.net/browse/ENGINEERS-549?focusedCommentId=69893
  // So, for now this block will work only for checkout ui custom
  if (checkoutcustom) {
    cy.get('body').then(($shippingBlockForCheckoutCustom) => {
      if (
        $shippingBlockForCheckoutCustom.find(selectors.ContinueShipping).length
      ) {
        const streetAddress = '19501 Biscayne Blvd'
        const postalCode = '33301'
        const city = 'Aventura'
        const state = 'CA'

        cy.qe(`Type Street address - ${streetAddress}`)
        cy.get(selectors.StreetAddress).clear().type(streetAddress)
        cy.qe(`Type postalCode - ${postalCode}`)
        cy.get(selectors.PostalCodeInput).clear().type(postalCode)
        cy.qe(`Type shipCity - ${city}`)
        cy.get(selectors.ShipCity).clear().type(city)
        cy.qe(`Select shipState - ${state}`)
        cy.get(selectors.ShipState, { timeout: 5000 })
          .should('not.be.disabled')
          .select(state)
      }
    })
  }

  cy.get('body').then(($shippingBlock) => {
    if ($shippingBlock.find(selectors.ContinueShipping).length) {
      cy.qe('Click continue shipping btn')
      cy.get(selectors.ContinueShipping, { timeout: 15000 })
        .should('be.visible')
        .click({ force: true })
    }

    if ($shippingBlock.find(selectors.ReceiverName).length) {
      cy.qe('Type ReceiverName - Syed')
      cy.get(selectors.ReceiverName, { timeout: 5000 })
        .should('be.visible')
        .type('Syed', {
          delay: 50,
        })
      shippingStrategySelector &&
        cy.get(shippingStrategySelector).should('be.visible').click()
      cy.qe('Click GotoPaymentBtn')
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
  phoneNumber = PHONE_NUMBER,
  checkoutcustom = false,
}) {
  cy.qe(
    `Click on proceed to payment button
    Fill the contact information by filling the firstname,lastName and phone number
    Adding intercept for shipping data
    Select the country and fill the address in the shipping address
    Click on DeliveryAddressText and wait for shippingdata intercept be completed
    Select pickup in store option in shipping preview container
    Click on ProceedtoPaymentBtn
    `
  )
  const { deliveryScreenAddress } = addressList[postalCode]

  cy.addDelayBetweenRetries(3000)
  if (cy.state('runnable')._currentRetry > 2) cy.reload()
  cy.setorderFormDebugItem()
  cy.get(selectors.CartTimeline).should('be.visible').click({ force: true })
  cy.get(selectors.ProceedtoPaymentBtn).should('be.visible').click()
  cy.get(selectors.FirstName).then(($el) => {
    if (Cypress.dom.isVisible($el)) {
      fillContactInfo(shippingStrategySelector, phoneNumber, checkoutcustom)
    }
  })

  cy.intercept('**/shippingData').as('shippingData')
  cy.fillAddress(postalCode, timeout).then(() => {
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
      cy.get(selectors.DeliveryAddressText, { timeout: 15000 })
        .invoke('text')
        .should(
          'match',
          new RegExp(`^${deliveryScreenAddress}|^${postalCode}$`, 'gi')
        )
      cy.get(selectors.ProceedtoPaymentBtn).should('be.visible').click()
    }

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
  cy.qe(`Updating the product quantity to ${quantity} `)
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
      cy.qe(`Set orderId ${orderIdEnv}:${orderId} in orders.json`)
      cy.setOrderItem(orderIdEnv, orderId)
    }

    if (externalSeller) {
      cy.qe(
        `Set orderId ${externalSeller.directSaleEnv}:${orderId} in orders.json`
      )
      cy.qe(
        `Set orderId ${externalSeller.externalSaleEnv}:${orderId.slice(
          0,
          -1
        )}2 in orders.json`
      )

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
  cy.qe(
    `Adding intercept to wait for the events API to be completed before visting home page`
  )
  cy.intercept('**/event-api/v1/*/event').as('events')
  cy.visit('/')
  cy.wait('@events')
  cy.qe("Verify the store front page should contain 'Hello'")
  cy.get('body').should('contain', 'Hello')
  cy.qe('Verifying the search bar should be visible in the store front')
  cy.qe(`searching product - ${searchKey} in the store front search bar`)
  // Search product in search bar
  cy.get(selectors.Search)
    .should('be.visible')
    .clear()
    .type(searchKey)
    .type('{enter}')
  // Page should load successfully now searchResult & Filter should be visible
  cy.qe(
    `Verfiying the search result is visible and having the text ${searchKey} in lowercase`
  )
  cy.get(selectors.searchResult)
    .should('be.visible')
    .should('have.text', searchKey.toLowerCase())
  cy.qe(`Verifying the filterHeading should be visible`)
  cy.get(selectors.FilterHeading).should('be.visible')
}

export function stopTestCaseOnFailure() {
  // Arrow function doesn't provide us a way to use this.currentTest
  // So, we are using normal function
  // eslint-disable-next-line func-names
  afterEach(function () {
    cy.qe('================================================')

    if (
      this.currentTest.state === 'passed' ||
      this.currentTest.currentRetry() === this.currentTest.retries()
    ) {
      cy.writeFile(getLogFile(), Cypress.env('logs'), { flag: 'a+' })
      cy.clearLogs()
    } else {
      cy.clearLogs()
    }

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
// TODO: Once we replace testSetup() to loginViaCookies() in all projects
// Then, Move logic() code to loginViaCookies() and delete testSetup(),logic()

function logic(storeFrontCookie, stop) {
  before(() => {
    cy.qe()
    cy.clearLogs()
    // Inject cookies
    cy.getVtexItems().then((vtex) => {
      cy.setCookie(vtex.authCookieName, vtex.adminAuthCookieValue, {
        log: false,
      })
      if (storeFrontCookie) {
        loginAsUser(vtex.robotMail, vtex.robotPassword)
      }
    })
  })
  beforeEach(function () {
    cy.qe(
      `Testcase title - ${
        Cypress.mocha.getRunner().suite.ctx.currentTest.title
      }, Attempt Number - ${this.currentTest.currentRetry() + 1}`
    )
  })
  if (stop) stopTestCaseOnFailure()
}

export function testSetup(storeFrontCookie = true, stop = true) {
  logic(storeFrontCookie, stop)
}

export function loginViaCookies({ storeFrontCookie = true, stop = true } = {}) {
  logic(storeFrontCookie, stop)
}

/* loginViaAPI - Use API for login
   before()
     a) Inject Authentication cookie
  afterEach()
     a) Stop Execution if testcase gets failed in all retries
*/

export function loginViaAPI({ storeFrontCookie = true, stop = true } = {}) {
  before(() => {
    cy.qe()
    // LoginAsAdmin
    loginAsAdmin()
    if (storeFrontCookie) {
      // LoginAsUser and visit home page
      cy.getVtexItems().then((vtex) => {
        loginAsUser(vtex.robotMail, vtex.robotPassword)
      })
    }
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
          cy.qe('Get total amount from TotalLabel')
          cy.qe(`Verify ${totalText} should be equal to ${totalAmount}`)
          expect(totalText).to.equal(totalAmount)
        })
    })
}

export function clickBtnOnVisibility(selector) {
  cy.get(selector).then(($el) => {
    if (Cypress.dom.isVisible($el)) {
      cy.get(selector).should('be.visible').click()
    }
  })
}
