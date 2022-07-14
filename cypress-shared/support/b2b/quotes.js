import selectors from '../common/selectors.js'
import { STATUSES } from './utils.js'
import { GRAPHL_OPERATIONS } from '../graphql_utils.js'
import { BUTTON_LABEL } from '../validation_text.js'
import { updateRetry } from '../common/support.js'

const DEFAULT_QUOTE_TOTAL = '$0.00'

export function fillQuoteInformation({
  quoteEnv,
  impersonatedRole,
  requestQuote = true,
  notes = false,
}) {
  cy.getVtexItems().then((vtex) => {
    cy.get(selectors.ItemsPriceInCart, { timeout: 15000 }).then(($div) => {
      // Make sure remove button is visible
      cy.get(selectors.RemoveProduct).should('be.visible')
      cy.get('#total-price div[class*=checkout-summary]')
        .should('be.visible')
        .should('contain', '$')

      const price = $div.text()

      cy.get(selectors.CreateQuote).last().should('be.visible').click()

      cy.get(selectors.CurrencyContainer, { timeout: 5000 }).should(
        'be.visible'
      )

      cy.get(selectors.QuoteTotal, { timeout: 8000 })
        .first()
        .should('not.contain', '$0.00')

      cy.get(selectors.QuoteName).should('be.visible').clear().type(quoteEnv)
      if (notes) {
        cy.get(selectors.Notes).should('be.visible').clear().type(notes)
      }

      cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
        if (req.body.operationName === GRAPHL_OPERATIONS.CreateQuote) {
          req.continue()
        }
      }).as(GRAPHL_OPERATIONS.CreateQuote)

      if (requestQuote) {
        if (!impersonatedRole) {
          cy.get('div')
            .contains(selectors.RequestQuote, { timeout: 5000 })
            .should('be.visible')
            .should('not.be.disabled')
            .click()
        } else {
          cy.get('div')
            .contains(selectors.SaveQuote, { timeout: 5000 })
            .should('be.visible')
            .should('not.be.disabled')
            .click()
        }
      } else {
        cy.get('div')
          .contains(selectors.SaveForLater, { timeout: 5000 })
          .should('be.visible')
          .should('not.be.disabled')
          .click()
      }

      cy.get(selectors.ToggleFields).should('be.visible')

      cy.wait(`@${GRAPHL_OPERATIONS.CreateQuote}`).then((req) => {
        const quoteId = req.response.body.data.createQuote.replace(
          'quotes-',
          ''
        )

        cy.setQuoteItem(`${quoteEnv}-price`, price)
        cy.setQuoteItem(quoteEnv, quoteId)
      })
    })
  })
}

export function createQuote(
  { product, quoteEnv, role, impersonatedRole },
  requestQuote = true,
  notes = false
) {
  const expectedStatus = requestQuote ? STATUSES.pending : STATUSES.ready

  const title = impersonatedRole
    ? `Create Quote by ${role} who impersonated ${impersonatedRole}, verify state is ${expectedStatus} and store in env ${quoteEnv}`
    : `Create Quote as ${role}, verify state is ${expectedStatus} and store in env ${quoteEnv}`

  const retries = impersonatedRole ? 1 : 3

  it(title, { retries }, () => {
    cy.closeCart()
    cy.searchProductinB2B(product)
    cy.waitForGraphql('addToCart', selectors.B2BAddtoCart)
    fillQuoteInformation({ quoteEnv, requestQuote, notes, impersonatedRole })
  })
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
      viewQuote(quoteId, false)
      cy.get(selectors.QuoteFromMyQuotesPage, { timeout: 10000 })
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
      viewQuote(quoteId, false)
      cy.get(selectors.QuoteFromMyQuotesPage, { timeout: 10000 })
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

function getExpectedStatus({ notes, discount, quantity, price }) {
  if (!notes && !discount && !quantity && !price) {
    throw Error('Atleast one of the options should be updated')
  }

  return discount || quantity || price ? STATUSES.ready : STATUSES.revised
}

function updateDiscount(discount, expectedStatus, saveQuote) {
  const { QuoteTotal, DiscountSliderContainer, SliderSelector, SliderToolTip } =
    selectors

  const transformAttribute = 'transform: translateX(50px) translateX(-50%)'

  cy.get(selectors.QuoteOrginalTotal)
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
              .trigger('change')

            cy.get(SliderToolTip).click()

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

                    cy.get(QuoteTotal, { timeout: 8000 })
                      .first()
                      .should('have.text', `$${discountedPrice.toFixed(2)}`)
                  })
              })
          } else {
            cy.log(`Discount already updated`)
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
        cy.scrollTo('bottom')
        cy.get(selectors.Notes).should('be.visible').clear().type(notes)
      } else {
        cy.wrap(false).as(saveQuote)
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
            if (!updatePriceField1 || updatePriceField2) {
              cy.wrap(updatePriceField2).as(saveQuote)
            }
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

function viewQuote(quote, open = true) {
  cy.gotoMyQuotes()
  cy.get(selectors.QuoteSearchQuery).clear().type(quote)
  cy.get(selectors.QuoteSearch).should('be.visible').click()
  if (open) {
    cy.contains(quote).click()
    cy.get(selectors.ProfileLabel).should('be.visible')
    cy.get(selectors.PageHeader)
      .should('be.visible')
      .should('contain', BUTTON_LABEL.QuoteDetails)
    cy.get(selectors.QuoteStatus).should('be.visible')
  } else {
    cy.log('Opening Quote is not allowed')
  }
}

export function updateQuote(
  quote,
  { notes = false, discount = false, quantity = false, price = null },
  multiple = false
) {
  const expectedStatus = getExpectedStatus({ notes, discount, quantity, price })
  const saveQuote = 'saveQuote'

  it(
    `${getdescription({
      notes,
      discount,
      quantity,
      price,
    })} - ${quote} and verify status ${expectedStatus}`,
    updateRetry(3),
    () => {
      cy.wrap(false).as(saveQuote)
      viewQuote(quote)

      if (notes) updateNotes(notes, saveQuote)

      if (discount) updateDiscount(discount, expectedStatus, saveQuote)

      if (price) updatePrice(price, multiple, saveQuote)

      if (quantity) updateQuantity(quantity, saveQuote)

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000)

      cy.get(`@${saveQuote}`).then((response) => {
        cy.get(selectors.QuoteStatus, { timeout: 8000 })
          .invoke('text')
          .then((currentStatus) => {
            if (currentStatus !== expectedStatus) {
              if (response) {
                cy.waitForGraphql(
                  GRAPHL_OPERATIONS.UpdateQuote,
                  selectors.SaveQuote,
                  true
                )
              } else {
                cy.log('Quote already got updated')
              }

              cy.get(selectors.QuoteStatus, { timeout: 8000 }).should(
                'have.text',
                expectedStatus
              )
            }
          })
      })
    }
  )
}

export function rejectQuote(quote, role) {
  const expectedStatus = STATUSES.declined

  it(`Decline quote from ${role}`, { retries: 2 }, () => {
    cy.gotoMyQuotes()
    cy.get(selectors.QuoteSearchQuery).clear().type(`${quote}{enter}`)
    cy.contains(quote).click()
    cy.get(selectors.ProfileLabel).should('be.visible')
    cy.get(selectors.QuoteStatus).should('be.visible')
    cy.get(selectors.QuoteTotal)
      .first()
      .should('not.have.text', DEFAULT_QUOTE_TOTAL)
    cy.checkStatusAndReject(expectedStatus).then((reject) => {
      if (reject) {
        cy.waitForGraphql(GRAPHL_OPERATIONS.UpdateQuote, selectors.Decline)
        cy.get(selectors.QuoteStatus).last().should('have.text', expectedStatus)
      } else {
        cy.log('Quote already rejeted')
      }
    })
  })
}

export function useQuoteForPlacingTheOrder(quote, role) {
  it(`Use Quote from ${role}`, updateRetry(2), () => {
    cy.gotoMyQuotes()
    cy.get(selectors.QuoteSearchQuery).clear().type(`${quote}{enter}`)
    cy.contains(quote).click()
    cy.get(selectors.ProfileLabel).should('be.visible')
    cy.get(selectors.QuoteStatus).should('be.visible')
    cy.get(selectors.QuoteTotal)
      .first()
      .should('not.have.text', DEFAULT_QUOTE_TOTAL)
      .invoke('text')
      .then((amountText) => {
        const amount = parseFloat(
          amountText.replace(/ /g, '').replace('$', ''),
          10
        )

        cy.setQuoteItem(`${quote}-price`, amount)

        cy.waitForGraphql(
          GRAPHL_OPERATIONS.UpdateQuote,
          selectors.UseQuoteButton
        )
      })
  })
}

export function verifySubTotal(quote) {
  it(`Verify SubTotal in checkoutPage`, updateRetry(2), () => {
    cy.getQuotesItems().then((quotes) => {
      const price = quotes[`${quote}-price`]

      cy.get(selectors.ProceedtoPaymentBtn).should('be.visible')
      cy.get(selectors.SubTotalLabel, { timeout: 10000 })
        .should('be.visible')
        .contains('Subtotal', { timeout: 6000 })
        .siblings('td.monetary', { timeout: 3000 })
        .should('have.text', `$ ${price.toFixed(2)}`)
      cy.get(selectors.ProceedtoPaymentBtn).should('be.visible').click()
    })
  })
}

export function searchQuote(quote, email = false) {
  const title = email
    ? `Searched Quote must have createdBy field with this email ${email}`
    : `Only Searched quote results should be available to the user`

  it(title, updateRetry(3), () => {
    cy.gotoMyQuotes()
    cy.get(selectors.QuoteSearchQuery).clear().type(`${quote}{enter}`)
    cy.contains(quote, { timeout: 8000 }).should('be.visible')
    cy.waitForGraphql(GRAPHL_OPERATIONS.GetQuotes, selectors.QuoteSearch)
    cy.get(selectors.QuoteFromMyQuotesPage).then(($els) => {
      let quotesList = Array.from($els, (el) => el.innerText)

      quotesList = quotesList.slice(0, quotesList.length / 2 + 1)
      quotesList.shift()
      expect(quotesList.every((q) => q.includes(quote))).to.be.true
      if (email) {
        cy.contains(email.toLowerCase(), { timeout: 8000 })
      }
    })
  })
}

function getPosition(organization, multi) {
  if (organization) return 2
  if (multi) return 3

  return 2
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
      .clear()
      .type(downarrowCount)
    cy.get(selectors.FilterLabel).contains(filterBy, {
      matchCase: false,
    })
    cy.get(selectors.FilterInput).clear().type(data)
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
  if (organization && costCenter) {
    return `organization - ${organization} & costCenter - ${costCenter}`
  }
}

export function filterQuote(costCenter, organization = false) {
  const title = getTitleForFilterQuoteTestCase(organization, costCenter)

  it(`Filter by ${title}`, () => {
    cy.gotoMyQuotes()
    cy.get(selectors.QuoteSearchQuery).clear()
    if (organization) {
      fillFilterBy(organization, organization)
    }

    if (costCenter) {
      fillFilterBy(costCenter, false, organization)
    }

    cy.get(selectors.Datas).then(($els) => {
      const texts = [...$els].map((el) => el.innerText)
      const rows = texts.filter((el) => el.includes('\n'))

      for (const row of rows) {
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

  it(title, updateRetry(2), () => {
    cy.gotoMyQuotes()
    cy.get(selectors.QuoteSearchQuery).clear()
    cy.get(selectors.QuotesFilterByStatus).click()
    for (const status in STATUSES) {
      const checkBoxSelector = `input[value='${status}']`

      cy.get(checkBoxSelector)
        .invoke('prop', 'checked')
        .then((checked) => {
          if (
            (!checked &&
              (status === expectedStatus1 || status === expectedStatus2)) ||
            (checked &&
              status !== expectedStatus1 &&
              status !== expectedStatus2)
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

export function preventQuoteUpdation() {
  it(
    'In checkout page, Quote should not be able to update',
    updateRetry(3),
    () => {
      cy.get('tr:nth-child(1) > div > td.quantity > input')
        .should('be.visible')
        .should('not.be.disabled')
        .focus()
        .clear()
        .type(`{backspace}5{enter}`)
      cy.get('#clear-cart').should('be.visible')
    }
  )
}

export function discountSliderShouldNotExist(quote) {
  it(`Discount Slider should not exist for this quote ${quote}`, () => {
    viewQuote(quote)
    cy.get(selectors.DiscountSliderContainer).should('not.exist')
    cy.get(selectors.Discount).should('have.text', '97%')
  })
}

export function verifyQuotesAndSavedCarts() {
  it(
    `Verify when we click QuotesAndSavedCarts section it should redirect us to quotes page`,
    updateRetry(1),
    () => {
      cy.gotoMyOrganization()
      cy.contains(selectors.QuotesAndSavedCarts).should('be.visible').click()
      cy.get(selectors.MyQuotes).should('be.visible').click()
    }
  )
}
