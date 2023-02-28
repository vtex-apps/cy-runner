import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from '../common/constants.js'
import { updateRetry } from '../common/support.js'

// Define constants
const config = Cypress.env()
const APP_NAME = 'vtex.b2b-organizations-graphql'
const APP_VERSION = '*.x'
const APP = `${APP_NAME}@${APP_VERSION}`
const { vtex } = config.base
const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`

export function deleteOrganization(search, organizationRequest = false) {
  // Default is organization, if organization request is true then delete organization request
  const func = organizationRequest ? 'Request' : ''

  it(
    `Deleting Organizations${func} which we created in this workspace ${search}`,
    updateRetry(2),
    () => {
      const GRAPHQL_DELETE_MUTATION =
        'mutation' +
        '($id: ID!)' +
        `{deleteOrganization${func}(id: $id){status}}`

      const queryName = `getOrganization${func}s`

      const GRAPHQL_SEARCH_QUERY =
        'query' +
        '($search: String!)' +
        `{${queryName}(search: $search){data{id,name}}}`

      cy.request({
        method: 'POST',
        url: CUSTOM_URL,
        body: {
          query: GRAPHQL_SEARCH_QUERY,
          variables: {
            search,
          },
        },
        headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
        ...FAIL_ON_STATUS_CODE,
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body).to.not.have.own.property('errors')
        for (const { id } of response.body.data[queryName].data) {
          cy.request({
            method: 'POST',
            url: CUSTOM_URL,
            body: {
              query: GRAPHQL_DELETE_MUTATION,
              variables: {
                id,
              },
            },
            headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
            ...FAIL_ON_STATUS_CODE,
          }).then((response2) => {
            expect(response2.status).to.equal(200)
            expect(
              response2.body.data[`deleteOrganization${func}`].status
            ).to.equal('success')
          })
        }
      })
    }
  )
}

export function verifySalesChannel(binding = true) {
  const salesChannel = binding ? 'Principal' : 'Dolar'

  it(`Verify Sales Channel having ${salesChannel}`, updateRetry(2), () => {
    cy.addDelayBetweenRetries(2000)
    const GRAPHQL_GET_SALES_CHANNEL_QUERY = 'query' + `{getSalesChannels{name}}`

    cy.request({
      method: 'POST',
      url: CUSTOM_URL,
      body: {
        query: GRAPHQL_GET_SALES_CHANNEL_QUERY,
      },
      headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
      ...FAIL_ON_STATUS_CODE,
    }).then(({ status, body }) => {
      expect(status).to.equal(200)
      expect(body.data.getSalesChannels.length).equal(1)
      expect(body.data.getSalesChannels[0].name).equal(salesChannel)
    })
  })
}

export function verifyBindings(email, binding) {
  it(`Verify Bindings with this emailId - ${email}`, updateRetry(4), () => {
    cy.addDelayBetweenRetries(30000)
    const GRAPHQL_GET_SALES_CHANNEL_QUERY =
      'query($email:String!){' + `getBinding(email:$email)}`

    cy.request({
      method: 'POST',
      url: CUSTOM_URL,
      body: {
        query: GRAPHQL_GET_SALES_CHANNEL_QUERY,
        variables: { email },
      },
      headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
      ...FAIL_ON_STATUS_CODE,
    }).then(({ status, body }) => {
      expect(status).to.equal(200)
      expect(body).to.have.property('data')
      expect(body.data).to.have.property('getBinding')
      expect(body.data.getBinding).equal(binding)
    })
  })
}

function bindingsMutation(payload) {
  const GRAPHQL_GET_SALES_CHANNEL_QUERY =
    'mutation($channels: [SalesChannelsInput]!){' +
    `saveSalesChannels(channels: $channels){` +
    `id,status,message}}`

  cy.request({
    method: 'POST',
    url: CUSTOM_URL,
    body: {
      query: GRAPHQL_GET_SALES_CHANNEL_QUERY,
      variables: payload,
    },
    headers: VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
    ...FAIL_ON_STATUS_CODE,
  }).then(({ status, body }) => {
    expect(status).to.equal(200)
    expect(body.data.saveSalesChannels.status).equal('success')
  })
}

export function addBindingsWhichShowsOrganization() {
  it(`Add Bindings which shows organization in profile page`, () => {
    bindingsMutation({
      channels: [
        {
          id: '1',
          name: 'Principal',
        },
      ],
    })
  })
}

export function addBindingsWhichHidesOrganization() {
  it(`Add Bindings which hides organization in profile page`, () => {
    bindingsMutation({
      channels: [
        {
          id: 2,
          name: 'Dolar',
        },
      ],
    })
  })
}
