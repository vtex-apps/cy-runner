import selectors from '../common/selectors.js'
import { fillQuoteInformation } from './quotes.js'
import { BUTTON_LABEL, TOAST_MSG } from '../validation_text.js'
import { GRAPHL_OPERATIONS } from '../graphql_utils.js'
import { validateToastMsg } from './utils.js'
import { updateRetry } from '../common/support.js'

export const POPUP_MSG = "You can't have more than 50 items"

function fillSkuAndQuantity(textArea, validate, skuQuantity) {
  cy.get(textArea).clear().type(skuQuantity)
  cy.get(validate).should('be.visible').click()
}

function checkBackButtonIsVisible(tableContainer, button) {
  cy.get('body').then(($body) => {
    if ($body.find(tableContainer).length > 1) {
      cy.get(button).contains(BUTTON_LABEL.back).click()
    }
  })
}

export function quickOrderBySkuAndQuantityTestCase2(role) {
  it(`Verify ${role} is able remove invalid skus in quick order - [Sku's Code],[Quantity]`, () => {
    const { textArea, validate, addtoCart, tableContainer, button } =
      selectors.QuickOrderPage().skus

    cy.gotoQuickOrder()
    checkBackButtonIsVisible(tableContainer, button)
    fillSkuAndQuantity(textArea, validate, '880270a,2{enter}1,2{enter}')
    cy.get(`${tableContainer} ${button}`).last().click()
    cy.get(addtoCart).should('be.visible')
  })
}

export function quickOrderBySkuAndQuantityTestCase1(role, quoteEnv) {
  it(`Verify ${role} is able to create quote by quick order - [Sku's Code],[Quantity]`, () => {
    cy.gotoQuickOrder()
    const { textArea, validate, invalid, content, addtoCart } =
      selectors.QuickOrderPage().skus

    fillSkuAndQuantity(textArea, validate, '1,2{enter}')
    cy.get(invalid).should('be.visible')
    cy.get(content).clear().type('880270a,2{enter}').focus()
    cy.get(invalid).click()
    cy.waitForGraphql(GRAPHL_OPERATIONS.addToCart, addtoCart)
    validateToastMsg(TOAST_MSG.addedToTheCart)
    cy.get(selectors.OpenCart).first().should('be.visible').click()
    fillQuoteInformation({ quoteEnv })
  })
}

export function quickOrderBySkuAnd51QuantityTestCase(role) {
  it(`Verify ${role} is able to add 50 products to cart with 51 quantity by quick order - [Sku's Code],[Quantity]`, () => {
    const { textArea, validate, addtoCart, remove, button } =
      selectors.QuickOrderPage().skus

    cy.gotoQuickOrder()
    cy.get(button).contains(BUTTON_LABEL.back).click()
    fillSkuAndQuantity(textArea, validate, '880270a,51{enter}')
    cy.waitForGraphql(GRAPHL_OPERATIONS.addToCart, addtoCart)
    validateToastMsg(POPUP_MSG)
    cy.get(selectors.OpenCart).first().should('be.visible').click()
    cy.get(selectors.QuantityInCart).should('have.value', 50)
    cy.get(remove).click()
    cy.get(selectors.CloseCart).click()
  })
}

function searchOneByOneProduct(search, { product, quantity }, number) {
  cy.get(search).should('be.visible').should('be.enabled').clear().type(product)
  cy.get('button .pr2 .truncate').should('be.visible')
  cy.get(search).type('{downarrow}{enter}')
  cy.get(quantity, { timeout: 10000 }).should('be.visible').clear().type(number)
}

export function quickOrderByOneByOneTestCase(role, product, quoteEnv) {
  it(
    `Verify ${role} is able to create quote by quick order - One by One`,
    updateRetry(1),
    () => {
      cy.gotoQuickOrder()
      const { search, quantity, add } = selectors.QuickOrderPage().oneByOne

      searchOneByOneProduct(search, { product, quantity }, 1)
      cy.get(add).should('be.visible').click()
      cy.get(selectors.QuickOrderPage().popupMsgSelector).should('be.visible')
      cy.get(selectors.ToastMsgInB2B).contains('added to the cart')
      cy.get(selectors.OpenCart).first().click()
      fillQuoteInformation({ quoteEnv })
    }
  )
}

export function quickOrderByOneByOneNegativeTestCase(role, product, quoteEnv) {
  it(
    `Verify ${role} is able to create quote by quick order with 51 products - One by One`,
    updateRetry(1),
    () => {
      cy.gotoQuickOrder()
      const { search, quantity, add, clear } =
        selectors.QuickOrderPage().oneByOne

      searchOneByOneProduct(search, { product, quantity }, 1)
      cy.get(clear).should('be.visible').click()
      searchOneByOneProduct(search, { product, quantity }, 51)
      cy.get(add).should('be.visible').click()
      cy.get(selectors.QuickOrderPage().popupMsgSelector).contains(POPUP_MSG)
      cy.get(selectors.OpenCart).first().click()
      // Use the product which is already added in cart
      fillQuoteInformation({ quoteEnv })
    }
  )
}

function quickOrderCategory(quoteEnv, number) {
  cy.gotoQuickOrder()
  const { product, addtoCart, quantity, title } =
    selectors.QuickOrderPage().categories

  cy.get(title).should('have.text', BUTTON_LABEL.QuickOrder)
  cy.contains(product).should('be.visible').click()
  cy.get(quantity, { timeout: 5000 })
    .first()
    .clear({ timeout: 5000 })
    .type(number)
  cy.get(addtoCart).should('be.visible').click()
  cy.get(selectors.ToastMsgInB2B, { timeout: 10000 }).contains(
    number > 50 ? POPUP_MSG : TOAST_MSG.addedToTheCart
  )
  cy.get(selectors.OpenCart).first().should('be.visible').click()
  // Use the product which is already added in cart
  fillQuoteInformation({ quoteEnv })
}

export function quickOrderByCategory(role, quoteEnv) {
  it(
    `Verify ${role} is able to create quote by quick order - Categories`,
    { retries: 2 },
    () => {
      quickOrderCategory(quoteEnv, 1)
    }
  )
}

export function quickOrderByCategoryNegativeTestCase(role, quoteEnv) {
  it(
    `Verify ${role} is able to create quote by quick order with 51 products - Categories`,
    { retries: 2 },
    () => {
      quickOrderCategory(quoteEnv, 51)
    }
  )
}

function validateForm(quoteEnv, vtex, productCount) {
  cy.intercept('POST', `${vtex.baseUrl}/**`).as('validateForm')
  cy.contains(BUTTON_LABEL.AddToCart).should('be.visible').click()
  cy.wait('@validateForm')
  cy.get(selectors.QuantityBadgeInCart).should('have.text', productCount)
  cy.get(selectors.OpenCart).first().should('be.visible').click()
  // Use the product which is already added in cart
  fillQuoteInformation({ quoteEnv })
}

function uploadXLS(filePath) {
  const { menu, title, link } = selectors.QuickOrderPage().uploadXLS

  cy.get(menu).click()
  cy.get(title).should('have.text', BUTTON_LABEL.QuickOrder)
  cy.get(link).click()
  cy.get(selectors.QuickOrderPage().uploadXLS.file, {
    timeout: 10000,
  }).attachFile(filePath)
  cy.get(selectors.QuickOrderPage().uploadXLS.validate).click()
}

export function quickOrderByXLS(quoteEnv) {
  it(
    `Create quick order by uploading excel`,
    {
      retries: 3,
    },
    () => {
      cy.getVtexItems().then((vtex) => {
        const filePath = 'model-quickorder.xls'

        uploadXLS(filePath)
        validateForm(quoteEnv, vtex, 2)
      })
    }
  )
}

export function quickOrderByXLSNegativeTestCase(quoteEnv) {
  it(
    `Create quick order by uploading xls with one valid and one invalid sku line item`,
    {
      retries: 3,
    },
    () => {
      cy.getVtexItems().then((vtex) => {
        const filePath = 'model-quickorder1.xls'

        uploadXLS(filePath)
        cy.get('svg[class*=vtex__icon-delete]:nth-child(1)').last().click()
        validateForm(quoteEnv, vtex, 1)
      })
    }
  )
}
