import selectors from '../common/selectors.js'
import { fillQuoteInformation } from '../b2b/quotes.js'
import { BUTTON_LABEL, TOAST_MSG } from '../validation_text.js'
import { GRAPHL_OPERATIONS } from '../graphql_utils.js'
import { validateToastMsg, validateToolTipMsg } from '../b2b/utils.js'
import { updateRetry } from '../common/support.js'

export const POPUP_MSG = "You can't have more than 50 items"

function ProceedToCheckOut() {
  cy.get(selectors.ProceedToCheckOut).should('be.visible').click()
}

function fillSkuAndQuantity(textArea, validate, skuQuantity) {
  cy.get(textArea).clear().type(skuQuantity, { force: true })
  cy.get(validate).should('be.visible').click()
}

function checkBackButtonIsVisible() {
  cy.closeMenuIfOpened()
  const [buttonsBlock, button] = [
    'div[class*=buttonsBlock]',
    'div[class*=vtex-button]',
  ]

  cy.get('body').then(($body) => {
    if ($body.find(buttonsBlock).length) {
      cy.get(button).contains(BUTTON_LABEL.back).click()
    }
  })
}

export function quickOrderBySkuAndQuantityTestCase2(role, b2b = true) {
  it(
    `Verify ${role} is able remove invalid skus in quick order - [Sku's Code],[Quantity]`,
    updateRetry(2),
    () => {
      const { textArea, validate } = selectors.QuickOrderPage().skus

      cy.gotoQuickOrder(b2b)
      checkBackButtonIsVisible()
      fillSkuAndQuantity(textArea, validate, '880270a,2{enter}1,2{enter}')
      checkBackButtonIsVisible()
    }
  )
}

export function quickOrderBySkuAndQuantityTestCase1(
  role,
  quoteEnv = false,
  totalPrice = '$180.00'
) {
  const title = `Verify ${role} is able to ${
    quoteEnv ? 'create quote by quick order' : 'add product to checkout'
  } - [Sku's Code],[Quantity]`

  it(title, updateRetry(2), () => {
    const { textArea, validate, invalid, content, addtoCart } =
      selectors.QuickOrderPage().skus

    cy.gotoQuickOrder(quoteEnv)
    checkBackButtonIsVisible()
    fillSkuAndQuantity(textArea, validate, '1,2{enter}')
    cy.get(invalid).should('be.visible')
    cy.get(content).clear().type('880270a,2{enter}').focus()
    cy.get(invalid).click()
    cy.waitForGraphql(GRAPHL_OPERATIONS.addToCart, addtoCart)
    validateToastMsg(TOAST_MSG.addedToTheCart)
    cy.get(selectors.OpenCart).first().should('be.visible').click()
    cy.get(selectors.MiniCartProductName).should('contain', 'Cauliflower')
    cy.get(selectors.TotalPrice).should('have.text', totalPrice)
    quoteEnv ? fillQuoteInformation({ quoteEnv }) : ProceedToCheckOut()
  })
}

export function quickOrderBySkuAnd51QuantityTestCase(role, b2b = true) {
  it(
    `Verify ${role} is able to add 50 products to cart with 51 quantity by quick order - [Sku's Code],[Quantity]`,
    updateRetry(2),
    () => {
      const { textArea, validate } = selectors.QuickOrderPage().skus

      cy.gotoQuickOrder(b2b)
      checkBackButtonIsVisible()
      fillSkuAndQuantity(textArea, validate, '880270a,51{enter}')
      // TODO: https://vtex-dev.atlassian.net/browse/QUICKORDER-37
      // Once above ticket gets fixed then disable below code
      // cy.get(addtoCart).should('not.exist')
      validateToolTipMsg(POPUP_MSG)
    }
  )
}

function searchOneByOneProduct(search, { product, quantity }, number) {
  cy.get(search).should('be.visible').should('be.enabled').clear()
  cy.get(search).should('be.visible').type(product)
  // Product will be shown in results only after below selector gets visibled
  cy.get('button[class*=customOption]').should('be.visible')
  cy.get(search).type('{downarrow}{enter}')
  number > 1 &&
    cy
      .get(quantity, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(`${number}`)
}

export function quickOrderByOneByOneTestCase(
  role,
  product,
  quoteEnv,
  totalPrice = '$540.00'
) {
  it(
    `Verify ${role} is able to ${
      quoteEnv ? 'create quote by' : 'use'
    } quick order - One by One`,
    updateRetry(2),
    () => {
      cy.gotoQuickOrder(quoteEnv)
      const { search, quantity, add } = selectors.QuickOrderPage().oneByOne

      searchOneByOneProduct(search, { product, quantity }, 1)
      cy.get(add).should('be.visible').click()
      cy.get(selectors.QuickOrderPage().popupMsgSelector).should('be.visible')
      cy.get(selectors.ToastMsgInB2B).contains('added to the cart')
      cy.get(selectors.OpenCart).first().click()
      cy.get(selectors.MiniCartProductName).should('contain', product)
      cy.get(selectors.TotalPrice).should('have.text', totalPrice)
      quoteEnv && fillQuoteInformation({ quoteEnv })
    }
  )
}

export function quickOrderByOneByOneNegativeTestCase(
  role,
  product,
  quoteEnv,
  totalPrice = '$27,000.00'
) {
  it(
    `Verify ${role} is able to ${
      quoteEnv ? 'create quote by' : 'use'
    } quick order with 51 products - One by One`,
    updateRetry(2),
    () => {
      cy.gotoQuickOrder(quoteEnv)
      const { search, quantity, add } = selectors.QuickOrderPage().oneByOne

      searchOneByOneProduct(search, { product, quantity }, 51)
      cy.get(add).should('be.visible').click()
      cy.get(selectors.QuickOrderPage().popupMsgSelector).contains(POPUP_MSG)
      cy.get(selectors.OpenCart).first().click()
      cy.get(selectors.MiniCartProductName)
        .should('be.visible')
        .should('contain', product)
      cy.get(selectors.TotalPrice).should('have.text', totalPrice)
      cy.get(selectors.MiniCartQuantityForMaxOrder).should('have.value', '50')
      // Use the product which is already added in cart
      quoteEnv && fillQuoteInformation({ quoteEnv })
    }
  )
}

function quickOrderCategory(quoteEnv, number, totalPrice) {
  cy.gotoQuickOrder(quoteEnv)
  const { product, addtoCart, quantity } = selectors.QuickOrderPage().categories

  cy.get(addtoCart).should('be.visible')
  cy.contains(product).should('be.visible').click()
  cy.get(quantity, { timeout: 15000 })
    .first()
    .scrollIntoView()
    .clear({ timeout: 8000 })
    .type(number, { force: true })
  cy.get(addtoCart).should('be.visible').click()
  cy.get(selectors.ToastMsgInB2B, { timeout: 10000 }).contains(
    number > 50 ? POPUP_MSG : TOAST_MSG.addedToTheCart
  )
  cy.get(selectors.OpenCart).first().should('be.visible').click()
  cy.get(selectors.MiniCartProductName).should('contain', 'Golf Shoes')
  cy.get(selectors.TotalPrice).should('have.text', totalPrice)
  if (number > 50) {
    cy.get(selectors.MiniCartQuantityForMaxOrder).should('have.value', '50')
  }

  // Use the product which is already added in cart
  quoteEnv && fillQuoteInformation({ quoteEnv })
}

export function quickOrderByCategory(role, quoteEnv, totalPrice = "'$94.00'") {
  it(
    `Verify ${role} is able ${
      quoteEnv ? `to create quote by` : `use`
    } quick order - Categories`,
    updateRetry(2),
    () => {
      quickOrderCategory(quoteEnv, 1, totalPrice)
    }
  )
}

export function quickOrderByCategoryNegativeTestCase(
  role,
  quoteEnv,
  totalPrice = '$4,700.00'
) {
  it(
    `Verify ${role} is able to create quote by quick order with 51 products - Categories`,
    updateRetry(2),
    () => {
      quickOrderCategory(quoteEnv, 51, totalPrice)
    }
  )
}

function validateForm(quoteEnv, vtex, productCount) {
  cy.intercept('POST', `${vtex.baseUrl}/**`).as('validateForm')
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(3000)
  cy.contains(BUTTON_LABEL.AddToCart).should('be.visible').click()
  cy.wait('@validateForm')
  cy.get(selectors.QuantityBadgeInCart).should('have.text', productCount)
  cy.get(selectors.OpenCart).first().should('be.visible').click()
  quoteEnv ? fillQuoteInformation({ quoteEnv }) : ProceedToCheckOut()
}

function uploadXLS(filePath, b2b) {
  const { deleteFile } = selectors.QuickOrderPage().uploadXLS

  cy.gotoQuickOrder(b2b)

  // If deleteFile selector exist then, it means we are retrying this testcase
  // close and upload CSV
  cy.get('body').then(($body) => {
    if ($body.find(deleteFile).length) {
      cy.get(deleteFile).should('be.visible').click({ multiple: true })
    }
  })
  checkBackButtonIsVisible()
  cy.get(selectors.QuickOrderPage().uploadXLS.file, {
    timeout: 10000,
  }).attachFile(filePath)
  cy.get(selectors.QuickOrderPage().uploadXLS.validate)
    .should('be.visible')
    .should('be.enabled')
    .click()
}

export function quickOrderByXLS(quoteEnv = false) {
  it(`Create quick order by uploading excel`, updateRetry(3), () => {
    cy.getVtexItems().then((vtex) => {
      const filePath = 'model-quickorder.xls'

      uploadXLS(filePath, quoteEnv)
      validateForm(quoteEnv, vtex, 2)
    })
  })
}

function validateNegativeTestCase(vtex) {
  cy.intercept('POST', `${vtex.baseUrl}/**`).as('validateForm')
  cy.contains(BUTTON_LABEL.AddToCart).should('be.visible').click()
  cy.wait('@validateForm')
  // if we use product with greater than max quantity then addtoCart should not be visible
  cy.contains(BUTTON_LABEL.AddToCart).should('not.exist')
}

export function quickOrderByXLSNegativeTestCase2(quoteEnv = false) {
  it(`Create quick order with above max quantity`, updateRetry(3), () => {
    cy.getVtexItems().then((vtex) => {
      const filePath = 'quickorder_with_max_quantity.xls'

      uploadXLS(filePath, quoteEnv)
      validateNegativeTestCase(vtex)
    })
  })
}

export function quickOrderByXLSNegativeTestCase(quoteEnv) {
  it(
    `Create quick order by uploading xls with one valid and one invalid sku line item`,
    updateRetry(3),
    () => {
      cy.getVtexItems().then((vtex) => {
        const filePath = 'model-quickorder1.xls'

        uploadXLS(filePath, quoteEnv)
        cy.get('svg[class*=vtex__icon-delete]:nth-child(1)').last().click()
        validateForm(quoteEnv, vtex, 1)
      })
    }
  )
}
