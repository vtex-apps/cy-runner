import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from '../common/constants.js'

// Define constants
const APP_NAME = 'vtex.b2b-organizations-graphql'
const APP_VERSION = '*.x'
const APP = `${APP_NAME}@${APP_VERSION}`

export function deleteOrganization(search, organizationRequest = false) {
  // Default is organization, if organization request is true then delete organization request
  const func = organizationRequest ? 'Request' : ''

  cy.getVtexItems().then((vtex) => {
    const CUSTOM_URL = `${vtex.baseUrl}/_v/private/admin-graphql-ide/v0/${APP}`

    const GRAPHQL_DELETE_MUTATION =
      'mutation' + '($id: ID!)' + `{deleteOrganization${func}(id: $id){status}}`

    const queryName = `getOrganization${func}s`

    const GRAPHQL_SEARCH_QUERY =
      'query' +
      '($search: String!)' +
      `{${queryName}(search: $search){data{id}}}`

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
  })
}

// query($id:ID!){
//   shippingPolicy(id:$id){
//     id,
//     name,
//     shippingMethod,
//     pickupPointsSettings{
//       pickupPointIds,
//       pickupPointTags,
//       sellers
//     }
//   }
// }

// {
//   "id": "sha1920ede3r"
// }

// {
//   "data": {
//     "shippingPolicy": {
//       "id": "sha1920ede3r",
//       "name": "Test Shipping",
//       "shippingMethod": "Normal (1234)",
//       "pickupPointsSettings": {
//         "pickupPointIds": [
//           "ssq13fae",
//           "456",
//           "12a0ff64-91e6-48ff-81a1-b6df58be6d4f",
//           "456789"
//         ],
//         "pickupPointTags": [],
//         "sellers": []
//       }
//     }
//   }
// }

// mutation($shippingPolicy: ShippingPolicyInput!){
//   updateShippingPolicy(shippingPolicy: $shippingPolicy){
//     id,
//     name
//   }
// }
