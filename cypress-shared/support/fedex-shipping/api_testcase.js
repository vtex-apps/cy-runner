import { loadDocksAPI, calculateShippingAPI } from '../common/apis'
import { updateRetry } from '../common/support'
import { FAIL_ON_STATUS_CODE } from '../common/constants'

export function loadDocks() {
  it('Load all dock connection', updateRetry(3), () => {
    cy.getVtexItems().then((vtex) => {
      cy.qe(
        `curl --location --request GET 'https://${vtex.baseUrl}/admin/shipping-strategy/loading-docks/?VtexIdclientAutCookie=eyJhbGciOiJFUzI1NiIsImtpZCI6IkQxNzQ3MkQ2NUEyQkJDNDVENjgwQkZENTY5RTM3RjFCOTdBNEEyMDkiLCJ0eXAiOiJqd3QifQ.eyJzdWIiOiJ2dGV4YXBwa2V5LXByb2R1Y3R1c3FhLU9GR0VIVCIsImFjY291bnQiOiJ2dGV4IiwiYXVkaWVuY2UiOiJhZG1pbiIsImV4cCI6MTY3NjYzNTg1MSwidXNlcklkIjoiODY3MmRiZmItYWIwYi00MWQ1LTlmZTMtYjBkM2M3NGM4MTEzIiwiaWF0IjoxNjc2NTQ5NDUxLCJpc3MiOiJ0b2tlbi1lbWl0dGVyIiwianRpIjoiZjk2MGI4ZWQtOTI1ZC00YjRkLThkYWItZDJiMmQ1MjY1NjU3In0.d5gppWjOuT07IGVNoOUhBileTtMq9VJWyOVZbxGs9SdGbuMRtspgC-vubX8yV46Z8foRq6KPd1a1d-JXTgK9Hw'`
      )
      cy.getAPI(loadDocksAPI(vtex.baseUrl)).then((response) => {
        expect(response.status).to.have.equal(200)
      })
    })
  })
}

export function loadCalculateShippingAPI(data, validateResponseFn) {
  return cy.getVtexItems().then((vtex) => {
    cy.qe(`curl --location --request POST 'https://app.io.vtex.com/vtexus.fedex-shipping/v1/${vtex.account}/fedexshipping6905585/shp-rates/calculate' \
    --header 'VtexIdclientAutCookie: eyJhbGciOiJFUzI1NiIsImtpZCI6IjU1MDUyN0YxMUJFMjRGNTAzRDNDRjlDQ0QwREE2NzA0NDhDQzFGNzAiLCJ0eXAiOiJqd3QifQ.eyJzdWIiOiJzYXJhdmFuYW4ucmVkZHlAdnRleC5jb20uYnIiLCJhY2NvdW50IjoicHJvZHVjdHVzcWEiLCJhdWRpZW5jZSI6IndlYnN0b3JlIiwic2VzcyI6IjdhNzY2YTIzLWZkNzYtNDY2Yi04NDljLWJmMzFjYjkzMmI0OCIsImV4cCI6MTY3NjkxNDAxMiwidXNlcklkIjoiM2M2NGIwMzAtYWUyMS00ODQyLWI5NDQtNGI5NmIzNGEyNzk5IiwiaWF0IjoxNjc2ODI3NjEyLCJpc3MiOiJ0b2tlbi1lbWl0dGVyIiwianRpIjoiODJiNzAyNzktNzg3Zi00NWYyLTg2NmItOTE0NWMzOTc0NjA4In0.945cB9ynobn5kDT-fAfWEwfCKdV9h9LK_MxF2kU9QfXXpQ-MkOD3vK1HEIEZjjj0pvYcRiWPyaMKt-7BcRnzVQ' \
    --header 'Content-Type: application/json' \
    --data-raw '{
      "data": {
        "items": [
          {
            "id": "880340",
            "quantity": 1,
            "groupId": null,
            "unitPrice": 500.0,
            "modal": "",
            "unitDimension": {
              "weight": 10.0,
              "height": 10,
              "width": 10,
              "length": 10
            }
          }
        ],
        "origin": {
          "zipCode": "33020",
          "country": "USA",
          "state": "FL",
          "city": "Hollywood",
          "coordinates": null,
          "residential": false
        },
        "destination": {
          "zipCode": "00010002",
          "country": "USA",
          "state": null,
          "city": null,
          "coordinates": null,
          "residential": false
        },
        "shippingDateUTC": "2022-05-31T01:02:45.128577+00:00",
        "currency": null
      }
    }
    '`)
    cy.getAppSettingstoJSON().then((items) => {
      cy.request({
        method: 'POST',
        url: calculateShippingAPI(vtex.account, Cypress.env('workspace').name),
        headers: {
          VtexIdclientAutCookie: items[vtex.userAuthCookieName],
        },
        ...FAIL_ON_STATUS_CODE,
        body: data,
      }).as('RESPONSE')

      if (validateResponseFn) {
        cy.get('@RESPONSE').then((response) => {
          expect(response.status).to.have.equal(200)
          validateResponseFn(response)
        })
      } else {
        return cy.get('@RESPONSE')
      }
    })
  })
}

export function validateCalculateShipping(response) {
  expect(response.status).to.have.equal(200)
  // If we receive empty array with valid payload then we can assume that fedex shipping site is down
  expect(response.body).to.be.an('array').and.to.have.lengthOf.above(0)
}

export function validateNonSupportedCountryCalculateShipping(response) {
  expect(response.status).to.have.equal(200)
  expect(response.body).to.be.an('array').and.to.be.empty
  // If we receive empty array with valid payload then we can assume that fedex shipping site is down
  // expect(response.body).to.be.an('array').and.to.have.lengthOf.above(0)
}

export function validateCustomDeliveryTime(response) {
  expect(response.status).to.have.equal(200)
  expect(response.body).to.be.an('array').and.to.have.lengthOf.above(0)
  if (response.body[0].estimateDate === null) {
    expect(response.body[0].estimateDate).to.have.equal('0')
  }
}
