import selectors from './cypress-template/common_selectors.js'
import { STATUSES } from './b2b_utils.js'
import { GRAPHL_OPERATIONS } from './graphql_utils.js'
import { BUTTON_LABEL } from './validation_text.js'

const DEFAULT_QUOTE_TOTAL = '$0.00'

export function fillQuoteInformation(
  quoteEnv,
  requestQuote = true,
  notes = false
) {
  cy.getVtexItems().then((vtex) => {
    cy.get(selectors.ItemsPriceInCart).then(($div) => {
      const price = $div.text()
      cy.get(selectors.CreateQuote).last().should('be.visible').click()
      cy.get(selectors.QuoteName).should('be.visible').type(quoteEnv)
      if (notes) cy.get(selectors.Notes).should('be.visible').type(notes)
      cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
        if (req.body.operationName === GRAPHL_OPERATIONS.CreateQuote) {
          req.continue()
        }
      }).as(GRAPHL_OPERATIONS.CreateQuote)
      cy.get(selectors.CurrencyContainer).should('be.visible')
      if (requestQuote)
        cy.get(selectors.RequestQuote)
          .should('be.visible')
          .should('not.be.disabled')
          .click()
      else
        cy.get(selectors.SaveForLater)
          .should('be.visible')
          .should('not.be.disabled')
          .click()

      cy.wait(`@${GRAPHL_OPERATIONS.CreateQuote}`).then((req) => {
        const quoteId = req.response.body.data.createQuote.replace(
          'quotes-',
          ''
        )
        cy.get(selectors.ToggleFields).should('be.visible')
        cy.setQuoteItem(`${quoteEnv}-price`, price)
        cy.setQuoteItem(quoteEnv, quoteId)
      })
    })
  })
}

export function createQuote(
  { product, quoteEnv, role },
  requestQuote = true,
  notes = false
) {
  const expectedStatus = requestQuote ? STATUSES.pending : STATUSES.ready
  it.skip(
    `Create Quote as ${role}, verify state is ${expectedStatus} and store in env ${quoteEnv}`,
    { retries: 3 },
    () => {
      cy.searchProduct(product)
      cy.get(selectors.B2BAddtoCart).first().click()
      fillQuoteInformation(quoteEnv, requestQuote, notes)
    }
  )
}

export function quoteShouldNotBeVisibleTestCase(
  currentOrganization,
  quoteId,
  organization
) {
  it(
    `${organization} user created Quote - ${quoteId} should not be visible for ${currentOrganization} user`,
    { retries: 2 },
    () => {
      cy.gotoMyQuotes()
      cy.get(selectors.QuoteFromMyQuotesPage)
        .invoke('text')
        .should('not.include', quoteId)
    }
  )
}

export function quoteShouldbeVisibleTestCase(
  currentOrganization,
  quoteId,
  organization
) {
  it(
    `${organization} user created Quote - ${quoteId} should be visible for ${currentOrganization} user`,
    { retries: 2 },
    () => {
      cy.gotoMyQuotes()
      cy.get(selectors.QuoteFromMyQuotesPage)
        .invoke('text')
        .should('include', quoteId)
    }
  )
}

function getdescription({ notes, discount, quantity, price }) {
  let description = null
  if (notes) {
    description = `Adding notes - ${notes}`
  } else if (discount) {
    description = `Adding discount of ${discount}`
  } else if (quantity && price) {
    description = `Updating price with ${price}, quantity ${quantity}`
  } else if (quantity) {
    description = `Updating quantity with ${quantity}`
  } else if (price) {
    description = `Updating price with ${price}`
  }

  return `${description} for this quote`
}

function getExpectedStatus(notes, discount, quantity, price) {
  if (!notes && !discount && !quantity && !price)
    throw Error('Atleast one of the options should be updated')

  return discount || quantity || price ? STATUSES.ready : STATUSES.revised
}

function updateDiscount(expectedStatus, saveQuote) {
  const { QuoteTotal, DiscountSliderContainer, SliderSelector, SliderToolTip } =
    selectors
  const transformAttribute = 'transform: translateX(50px) translateX(-50%)'
  cy.get(selectors.QuoteTotal)
    .first()
    .should('not.have.text', DEFAULT_QUOTE_TOTAL)
    .invoke('text')
    .then((amountText) => {
      cy.get(selectors.QuoteStatus)
        .first()
        .invoke('text')
        .then((status) => {
          if (status !== expectedStatus) {
            cy.wrap(true).as(saveQuote)
            const amount = +amountText.replace('$', '')
            const discountedPrice = amount * ((100 - discount) / 100)
            cy.get(DiscountSliderContainer)
              .invoke('attr', 'style', transformAttribute)
              .should('have.attr', 'style', transformAttribute)
            cy.get(SliderSelector).should('be.visible').click()
            cy.get(SliderToolTip)
              .should('not.have.text', '0%')
              .invoke('text')
              .then((percentage) => {
                const currentPercentage = +percentage.replace('%', '')
                cy.get(DiscountSliderContainer)
                  .should('not.have.attr', 'style', transformAttribute)
                  .invoke('attr', 'style')
                  .then((transform) => {
                    const r = /transform: translateX\((\d.*)px\)/
                    const pixelPerPercentage =
                      transform.match(r)[1] / currentPercentage
                    const expectedpixel = pixelPerPercentage * discount
                    cy.get(DiscountSliderContainer).invoke(
                      'attr',
                      'style',
                      `transform: translateX(${expectedpixel}px) translateX(-50%)`
                    )
                    cy.get(SliderSelector).should('be.visible').click()
                    cy.get(SliderToolTip, {
                      timeout: 4000,
                    }).should('have.text', `${discount}%`)
                    cy.get(SliderSelector).should('be.visible').click()
                    cy.get(QuoteTotal)
                      .first()
                      .should('have.text', `$${discountedPrice.toFixed(2)}`)
                  })
              })
          }
        })
    })
}

function updateNotes(notes, saveQuote) {
  cy.get(selectors.Notes)
    .last()
    .invoke('text')
    .then((notesDescription) => {
      if (notesDescription !== `Notes:\n${notes}`) {
        cy.wrap(true).as(saveQuote)
        cy.get(selectors.Notes).type(notes)
      }
    })
}

function updatePrice(price, multiple, saveQuote) {
  cy.checkAndFillData(selectors.PriceField, price, 0).then(
    (updatePriceField1) => {
      cy.wrap(updatePriceField1).as(saveQuote)
      if (multiple) {
        cy.checkAndFillData(selectors.PriceField, price, 1).then(
          (updatePriceField2) => {
            if (!updatePriceField1 || updatePriceField2)
              cy.wrap(updatePriceField2).as(saveQuote)
          }
        )
      }
    }
  )
}

function updateQuantity(quantity, saveQuote) {
  cy.checkAndFillData(selectors.QuantityField, quantity).then((update) => {
    cy.wrap(update).as(saveQuote)
  })
}

export function updateQuote(
  quote,
  { notes = false, discount = false, quantity = false, price = null },
  multiple = false
) {
  const expectedStatus = getExpectedStatus(notes, discount, quantity, price)
  const saveQuote = 'saveQuote'
  it(
    `${getdescription({
      notes,
      discount,
      quantity,
      price,
    })} - ${quote} and verify status ${expectedStatus}`,
    { retries: 3 },
    function () {
      cy.wrap(false).as(saveQuote)
      cy.gotoMyQuotes()
      cy.get(selectors.QuoteSearch).clear()
      cy.contains(quote).click()
      cy.get(selectors.ProfileLabel).should('be.visible')
      cy.get(selectors.PageHeader)
        .should('be.visible')
        .should('have.text', BUTTON_LABEL.QuoteDetails)
      cy.get(selectors.QuoteStatus).should('be.visible')
      if (notes) updateNotes(notes, saveQuote)
      if (discount) updateDiscount(expectedStatus, saveQuote)
      if (price) updatePrice(price, multiple, saveQuote)
      if (quantity) updateQuantity(quantity, saveQuote)
      cy.get(`@${saveQuote}`).then((response) => {
        if (response) {
          cy.waitForGraphql(GRAPHL_OPERATIONS.UpdateQuote, selectors.SaveQuote)
        } else cy.log('Quote already got updated')
        cy.get(selectors.QuoteStatus)
          .first()
          .should('have.text', expectedStatus)
      })
    }
  )
}

export function rejectQuote(quote, role) {
  const expectedStatus = STATUSES.declined
  it(`Decline quote from ${role}`, { retries: 2 }, () => {
    cy.gotoMyQuotes()
    cy.contains(quote).click()
    cy.get(selectors.ProfileLabel).should('be.visible')
    cy.get(selectors.QuoteStatus).should('be.visible')
    cy.get(selectors.QuoteTotal)
      .first()
      .should('not.have.text', DEFAULT_QUOTE_TOTAL)
    cy.checkStatusAndReject(expectedStatus).then((reject) => {
      if (reject) {
        cy.waitForGraphql(GRAPHL_OPERATIONS.UpdateQuote, selectors.Decline)
        cy.get(selectors.QuoteStatus)
          .first()
          .should('have.text', expectedStatus)
      } else cy.log('Quote already rejeted')
    })
  })
}

export function useQuoteForPlacingTheOrder(quote, role) {
  it(`Verify quote and Place the order from ${role}`, { retries: 3 }, () => {
    cy.gotoMyQuotes()
    cy.get(selectors.QuoteSearch).clear()
    cy.contains(quote).click()
    cy.get(selectors.ProfileLabel).should('be.visible')
    cy.get(selectors.QuoteStatus).should('be.visible')
    cy.get(selectors.QuoteTotal)
      .first()
      .should('not.have.text', DEFAULT_QUOTE_TOTAL)
      .invoke('text')
      .then((amountText) => {
        let text = amountText.replace(/ /g, '')
        const amount = +text.replace('$', '')

        cy.waitForGraphql(
          GRAPHL_OPERATIONS.UpdateQuote,
          selectors.UseQuoteButton
        )
        cy.get(selectors.NewProductPrice).should(
          'have.text',
          `$ ${amount.toFixed(2)}`
        )
        cy.get(selectors.ProceedtoPaymentBtn).should('be.visible').click()
      })
  })
}

export function searchQuote(quote) {
  it.skip('Only Searched quote results should be available to the user', () => {
    cy.gotoMyQuotes()
    cy.get(selectors.QuoteSearch).type(quote)
    cy.get(selectors.QuoteFromMyQuotesPage).then(($els) => {
      let quotesList = Array.from($els, (el) => el.innerText)
      quotesList = quotesList.slice(0, quotesList.length / 2 + 1)
      quotesList.shift()
      expect(quotesList.every((q) => q.includes(quote))).to.be.true
    })
  })
}

function getPosition(organization, multi) {
  if (organization) return 2
  else if (multi) return 3
  else return 2
}

function fillFilterBy(data, organization = false, multi = false) {
  cy.getVtexItems().then((vtex) => {
    const filterBy = organization ? 'Organization' : 'Cost Center'
    const downarrowCount = !organization
      ? '{downarrow}{downarrow}{enter}'
      : '{downarrow}{enter}'
    cy.contains(/More/i).click()
    cy.contains(/Select a filter/i)
      .click()
      .type(downarrowCount)
    cy.get(selectors.FilterLabel).contains(filterBy, {
      matchCase: false,
    })
    cy.get(selectors.FilterInput).type(data)
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === GRAPHL_OPERATIONS.GetQuotes) {
        req.continue()
      }
    }).as(GRAPHL_OPERATIONS.GetQuotes)
    cy.get('button > div').contains('Apply').click()
    cy.wait(`@${GRAPHL_OPERATIONS.GetQuotes}`)
    const position = getPosition(organization, multi)
    cy.get(`.ma2:nth-child(${position}) span.nowrap`)
      .invoke('text')
      .should('contain', `${data}`)
  })
}

function getTitleForFilterQuoteTestCase(organization, costCenter) {
  if (costCenter) return `costCenter ${costCenter}`
  if (organization && costCenter)
    return `organization - ${organization} & costCenter - ${costCenter}`
}

export function filterQuote(costCenter, organization = false) {
  const title = getTitleForFilterQuoteTestCase(organization, costCenter)

  it.skip(`Filter by ${title}`, () => {
    cy.gotoMyQuotes()
    cy.get(selectors.QuoteSearch).clear()
    if (organization) {
      fillFilterBy(organization, organization)
    }
    if (costCenter) {
      fillFilterBy(costCenter, false, organization)
    }
    cy.get(selectors.Datas).then(($els) => {
      const texts = [...$els].map((el) => el.innerText)
      const rows = texts.filter((el) => el.includes('\n'))
      for (let row of rows) {
        const datas = row.split('\n')
        for (let i = 7; i <= datas.length; i += 8) {
          if (organization) expect(datas[i - 1]).equal(organization)
          expect(datas[i]).equal(costCenter)
        }
      }
    })
  })
}

const checkAllElementsAreTrue = (resp) => resp.every(Boolean)

export function filterQuoteByStatus(expectedStatus1, expectedStatus2 = null) {
  const title = `Filter Quote by status ${expectedStatus1} ${
    expectedStatus2 ? `and ${expectedStatus2}` : ''
  }`

  it(title, () => {
    cy.gotoMyQuotes()
    cy.get(selectors.QuoteSearch).clear()
    cy.get(selectors.QuotesFilterByStatus).click()
    for (let status in STATUSES) {
      const checkBoxSelector = `input[value='${status}']`
      cy.get(checkBoxSelector)
        .invoke('prop', 'checked')
        .then((checked) => {
          if (
            (!checked &&
              (status === expectedStatus1 || status === expectedStatus2)) ||
            (checked && status != expectedStatus1 && status != expectedStatus2)
          ) {
            cy.get(checkBoxSelector).click()
          }
        })
    }
    cy.get('button > div').contains('Apply').click()
    cy.get(selectors.QuoteFromMyQuotesPage).then(($els) => {
      let quotesList = Array.from($els, (el) => el.innerText)
      cy.get(selectors.ClearFilter).click()
      quotesList.reverse()
      quotesList = quotesList.slice(0, quotesList.length / 2)
      const comparison = quotesList.map((q) => {
        return q.includes(expectedStatus1) || q.includes(expectedStatus2)
      })
      expect(checkAllElementsAreTrue(comparison)).to.be.true
    })
  })
}
