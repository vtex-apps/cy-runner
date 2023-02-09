import selectors from '../common/selectors.js'
import { fillQuoteInformation } from '../b2b/quotes.js'
import { BUTTON_LABEL, TOAST_MSG } from '../validation_text.js'
import { GRAPHL_OPERATIONS } from '../graphql_operations.js'
import { validateToastMsg, validateToolTipMsg } from '../b2b/utils.js'
import { updateRetry } from '../common/support.js'

export const POPUP_MSG = "You can't have more than 50 items"
export const TOOLTIP_MSG = {
  skuNotFound: /SKU Not Found/i,
  maxQuantity: /Max quantity is 50(.*)/i,
}

function ProceedToCheckOut() {
  cy.qe('Clicking on proceed to checkout')
  cy.get(selectors.ProceedToCheckOut).should('be.visible').click()
}

function fillSkuAndQuantity(textArea, validate, skuQuantity) {
  cy.qe(
    'Fill the skuquantity ,check the validate text visibility then click on it'
  )
  cy.get(textArea).clear().type(skuQuantity, { force: true })
  cy.get(validate).should('be.visible').click()
}

function checkBackButtonIsVisible() {
  cy.qe('Checking the back button visisbility in the page')
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
    quoteEnv
      ? 'create quote by quick order'
      : 'add product to cart & perform checkout'
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
    cy.qe(`click on Add to cart`)
    cy.waitForGraphql(GRAPHL_OPERATIONS.addToCart, addtoCart)
    validateToastMsg(TOAST_MSG.addedToTheCart)
    cy.qe(`Open the cart and click on first item`)
    cy.get(selectors.OpenCart).first().should('be.visible').click()
    cy.qe(`The minicart should contain the product name Cauliflower`)
    cy.get(selectors.MiniCartProductName).should('contain', 'Cauliflower')
    cy.qe(`verify the total price`)
    cy.get(selectors.TotalPrice).should('have.text', totalPrice)
    quoteEnv ? fillQuoteInformation({ quoteEnv }) : ProceedToCheckOut()
  })
}

export function quickOrderBySkuAnd51QuantityTestCase(role, b2b = true) {
  it(
    `Verify ${role} is able to add 50 products to cart with 51 quantity by quick order - [Sku's Code],[Quantity]`,
    updateRetry(2),
    () => {
      const { textArea, validate, addtoCart } = selectors.QuickOrderPage().skus

      cy.gotoQuickOrder(b2b)
      checkBackButtonIsVisible()
      fillSkuAndQuantity(textArea, validate, '880270a,51{enter}')
      cy.qe('Verify addtoCart button should not exists')
      cy.get(addtoCart).should('not.exist')
      validateToolTipMsg(TOOLTIP_MSG.maxQuantity)
    }
  )
}

export function quickOrderBySkuAndQuantityWithValidAndInValidSkuTestCase(
  role,
  b2b = true
) {
  it(
    `Verify ${role} is not able to use one invalid & valid skus  - [Sku's Code],[Quantity]`,
    updateRetry(2),
    () => {
      const { textArea, validate, addtoCart } = selectors.QuickOrderPage().skus

      cy.gotoQuickOrder(b2b)
      checkBackButtonIsVisible()
      fillSkuAndQuantity(textArea, validate, '880270a,51{enter}1,2{enter}')
      cy.qe('Verify addtoCart should not exists')
      cy.get(addtoCart).should('not.exist')
      validateToolTipMsg(TOOLTIP_MSG.maxQuantity, 0)
      validateToolTipMsg(TOOLTIP_MSG.skuNotFound, 1)
    }
  )
}

function searchOneByOneProduct(search, { product, quantity }, number) {
  cy.qe(`Search for the product ${product}`)
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
      cy.get(selectors.ToastMsgInB2B)
        .should('be.visible')
        .contains('added to the cart')
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
      cy.qe(`Verify the ${POPUP_MSG} in the QuickorderPage`)
      cy.get(selectors.QuickOrderPage().popupMsgSelector).contains(POPUP_MSG)
      cy.qe('Opening the cart and selecting the first item')
      cy.get(selectors.OpenCart).first().click()
      cy.qe(`Verify the mininCartproductname contains ${product}`)
      cy.get(selectors.MiniCartProductName)
        .should('be.visible')
        .should('contain', product)
      cy.qe(`Verify the totalprice - ${totalPrice}`)
      cy.get(selectors.TotalPrice).should('have.text', totalPrice)
      cy.qe('Verify the minicartQuantity should have the value of 50')
      cy.get(selectors.MiniCartQuantityForMaxOrder).should('have.value', '50')
      // Use the product which is already added in cart
      quoteEnv && fillQuoteInformation({ quoteEnv })
    }
  )
}

function quickOrderCategory(quoteEnv, number, totalPrice) {
  cy.gotoQuickOrder(quoteEnv)
  const { product, addtoCart, quantity } = selectors.QuickOrderPage().categories

  cy.qe('Verify the addtoCart should be visible and contains the product')
  cy.get(addtoCart).should('be.visible')
  cy.qe(`Click the product - ${product}`)
  cy.contains(product).should('be.visible').click()
  cy.get(quantity, { timeout: 15000 })
    .first()
    .scrollIntoView()
    .clear({ timeout: 8000 })
    .type(number, { force: true })
  cy.qe('Verify the addtoCart should be visible then click on the product')
  cy.get(addtoCart).should('be.visible').click()
  cy.get(selectors.ToastMsgInB2B, { timeout: 10000 })
    .should('be.visible')
    .contains(number > 50 ? POPUP_MSG : TOAST_MSG.addedToTheCart)
  cy.qe(`Verify the openCart is visible then click on it`)
  cy.get(selectors.OpenCart).first().should('be.visible').click()
  cy.qe('Verify the MiniCartProductname should contain Golf Shoes')
  cy.get(selectors.MiniCartProductName).should('contain', 'Golf Shoes')
  cy.qe(`Verify the totalPrice - ${totalPrice}`)
  cy.get(selectors.TotalPrice).should('have.text', totalPrice)
  if (number > 50) {
    cy.get(selectors.MiniCartQuantityForMaxOrder).should('have.value', '50')
  }

  // Use the product which is already added in cart
  quoteEnv && fillQuoteInformation({ quoteEnv })
}

export function quickOrderByCategory(role, quoteEnv, totalPrice = '$94.00') {
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
  cy.qe('Adding intercept for validateForm')
  cy.intercept('POST', `${vtex.baseUrl}/**`).as('validateForm')
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(5000)
  cy.qe('Verify AddToCart button is visible and click on it')
  cy.contains(BUTTON_LABEL.AddToCart).should('be.visible').click()
  cy.wait('@validateForm')
  cy.qe('Validate the Quantity in QuantityBadgeCart')
  cy.get(selectors.QuantityBadgeInCart, { timeout: 15000 }).should(
    'have.text',
    productCount
  )
  cy.qe('Verify openCart is visible then click on it')
  cy.get(selectors.OpenCart).first().should('be.visible').click()
  quoteEnv ? fillQuoteInformation({ quoteEnv }) : ProceedToCheckOut()
}

function uploadXLS(filePath, b2b) {
  const { deleteFile } = selectors.QuickOrderPage().uploadXLS

  cy.qe(`Visit Quickorder homepage and verify the profile should be visible`)
  cy.gotoQuickOrder(b2b)

  // If deleteFile selector exist then, it means we are retrying this testcase
  // close and upload CSV
  cy.get('body').then(($body) => {
    if ($body.find(deleteFile).length) {
      cy.get(deleteFile, { timeout: 10000 })
        .should('be.visible')
        .click({ multiple: true })
    }
  })
  cy.qe(`Check the backbutton visibility in the page`)
  checkBackButtonIsVisible()
  cy.qe(`Attach the Xls file `)
  cy.get(selectors.QuickOrderPage().uploadXLS.file, {
    timeout: 10000,
  }).attachFile(filePath)
  cy.qe(`verify the validate button is enabled and visible then click on it`)
  cy.get(selectors.QuickOrderPage().uploadXLS.validate)
    .should('be.visible')
    .should('be.enabled')
    .click()
}

export function quickOrderByXLS(quoteEnv = false) {
  it(`Create quick order by uploading excel`, updateRetry(3), () => {
    cy.getVtexItems().then((vtex) => {
      cy.qe(`Pass the pathname to upload an XLS file`)
      const filePath = 'model-quickorder.xls'

      uploadXLS(filePath, quoteEnv)
      validateForm(quoteEnv, vtex, 2)
    })
  })
}

function validateNegativeTestCase() {
  cy.contains(BUTTON_LABEL.AddToCart).should('not.exist')
}

export function quickOrderByXLSNegativeTestCase2(quoteEnv = false) {
  it(`Create quick order with above max quantity`, updateRetry(3), () => {
    const filePath = 'quickorder_with_max_quantity.xls'

    cy.qe('Uploading Xls file with one valid and invalid sku line item')
    uploadXLS(filePath, quoteEnv)
    cy.qe('Validate addToCart should not exists')
    validateNegativeTestCase()
    cy.qe(`Validate the ${TOOLTIP_MSG.maxQuantity}`)
    validateToolTipMsg(TOOLTIP_MSG.maxQuantity)
  })
}

export function quickOrderByXLSNegativeTestCase(quoteEnv) {
  it(
    `Create quick order by uploading xls with one valid and one invalid sku line item`,
    updateRetry(3),
    () => {
      const filePath = 'model-quickorder1.xls'

      cy.qe('Uploading Xls file with one valid and invalid sku line item')
      uploadXLS(filePath, quoteEnv)
      cy.qe(`Validate the ${TOOLTIP_MSG.maxQuantity}`)
      validateToolTipMsg(TOOLTIP_MSG.maxQuantity)
      cy.qe(`Validate the ${TOOLTIP_MSG.skuNotFound}`)
      validateToolTipMsg(TOOLTIP_MSG.skuNotFound, 1)
      cy.get('svg[class*=vtex__icon-delete]:nth-child(1)').last().click()
      cy.qe('Validate addToCart should not exists')
      validateNegativeTestCase()
      cy.qe(`Validate the ${TOOLTIP_MSG.maxQuantity}`)
      validateToolTipMsg(TOOLTIP_MSG.maxQuantity)
    }
  )
}

export function verifyExcelFile(fileName, products) {
  it('verify the data and extension', updateRetry(3), () => {
    cy.qe(`Verify the excel file data are equal and should be greater than one`)
    cy.task('readXlsx', {
      file: fileName,
      sheet: 'SheetJS',
    }).then((rows) => {
      expect(rows.length).to.be.greaterThan(1)
      expect(JSON.stringify(rows)).to.be.equal(JSON.stringify(products))
    })
  })
}
