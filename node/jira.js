const axios = require('axios')

// Search issues on Jira
async function searchIssue(JIRA_ACCOUNT, JIRA_AUTHORIZATION, JIRA_JQL) {
  // Payload
  const data = JSON.stringify({
    expand: [],
    jql: JIRA_JQL,
    maxResults: 1,
    fieldsByKeys: false,
    fields: ['summary', 'status', 'assignee'],
    startAt: 0,
  })

  // Configuration
  const config = {
    method: 'post',
    url: `https://${JIRA_ACCOUNT}.atlassian.net/rest/api/3/search`,
    headers: {
      Authorization: `Basic ${JIRA_AUTHORIZATION}`,
      'Content-Type': 'application/json',
    },
    data,
  }

  let key = false

  await axios(config)
    .then((response) => {
      if (response.data.total) {
        key = response.data.issues[0].key
        process.stdout.write(`[QE] ===> Key ${key} found, uptating it...\n`)
      }
    })
    .catch((_error) => {
      process.stderr.write(`[QE] ===> Error searching the issue on Jira.\n`)
      key = 'error'
    })

  return key
}

// Create issues on Jira
async function createIssue(vtexJson, testErrors) {
  // GitHub and Cypress
  const GH_REPO = process.env.GITHUB_REPOSITORY
  const [, GH_PROJECT] = GH_REPO.split('/')
  const [, , GH_REF] = process.env.GITHUB_REF.split('/')
  const GH_RUN = process.env.GITHUB_RUN_ID
  const GH_URL = process.env.GITHUB_SERVER_URL
  const GH_PR = process.env.GITHUB_RUN_NUMBER
  const GH_ACTOR = process.env.GITHUB_ACTOR
  const PR_URL = `${GH_URL}/${GH_REPO}/pull/${GH_REF}`
  const CY_URL = 'https://dashboard.cypress.io/projects/9myhsu/runs'
  const RUN_URL = `${GH_URL}/${GH_REPO}/actions/runs/${GH_RUN}`

  // Jira
  const ERRORS = testErrors.join(', ')
  const { JIRA_ACCOUNT, JIRA_AUTHORIZATION, JIRA_KEY, JIRA_ISSUE_TYPE } =
    vtexJson

  const JIRA_SUMMARY = `PR #${GH_PR}: ${GH_PROJECT} E2E test failed`
  const JIRA_JQL =
    `summary ~ "${JIRA_SUMMARY}" AND project = "${JIRA_KEY}"` +
    'AND statusCategory IN ("undefined", "In Progress", "To Do")'

  // Payload for ticket creation
  const dataCreation = JSON.stringify({
    fields: {
      project: {
        key: JIRA_KEY,
      },
      summary: JIRA_SUMMARY,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'E2E test for ',
              },
              {
                type: 'text',
                text: `PR #${GH_PR}`,
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: PR_URL,
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: ` created by ${GH_ACTOR} failed on test number(s) ${ERRORS}.`,
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'To get more information about the errors, please take a look at ',
              },
              {
                type: 'text',
                text: `artifacts on GitHub Action`,
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: RUN_URL,
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: ' or ',
              },
              {
                type: 'text',
                text: `Cypress Dashboard`,
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: CY_URL,
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: '.',
              },
            ],
          },
        ],
      },
      issuetype: {
        name: JIRA_ISSUE_TYPE,
      },
    },
    update: {},
  })

  // Config for ticket creation
  const configCreation = {
    method: 'post',
    url: `https://${JIRA_ACCOUNT}.atlassian.net/rest/api/3/issue`,
    headers: {
      Authorization: `Basic ${JIRA_AUTHORIZATION}`,
      'Content-Type': 'application/json',
    },
    data: dataCreation,
  }

  // Payload for ticket update
  const dataUpdate = JSON.stringify({
    body: {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'E2E test for ',
            },
            {
              type: 'text',
              text: `PR #${GH_PR}`,
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: PR_URL,
                  },
                },
              ],
            },
            {
              type: 'text',
              text: ` failed on test number(s) ${ERRORS}.`,
            },
          ],
        },
      ],
    },
    visibility: null,
  })

  // Config for ticket update
  const configUpdate = {
    method: 'post',
    url: `https://${JIRA_ACCOUNT}.atlassian.net/rest/api/3/issue/${JIRA_EXISTENT_KEY}/comment`,
    headers: {
      Authorization: `Basic ${JIRA_AUTHORIZATION}`,
      'Content-Type': 'application/json',
    },
    data: dataUpdate,
  }

  process.stdout.write(`[QE] ===> Searching by this issue on Jira...\n`)

  const JIRA_EXISTENT_KEY = await searchIssue(
    JIRA_ACCOUNT,
    JIRA_AUTHORIZATION,
    JIRA_JQL
  )

  // Update or create the issue
  switch (JIRA_EXISTENT_KEY) {
    // Error on search for Jira ticket
    case 'error':
      process.stderr.write(
        `[QE] ===> Same error happen when searching by this issue on Jira... avoiding issue creation.\n`
      )
      break

    // Issue doesn't exist, create it
    case false:
      process.stdout.write(`[QE] ===> Creating an issue on Jira...\n`)
      // Creation
      axios(configCreation)
        .then((response) => {
          const { key: ISSUE_KEY } = response.data

          process.stdout.write(
            `[QE] ===> Issue ${ISSUE_KEY} created on Jira.\n`
          )
        })
        .catch((_error) => {
          process.stderr.write(`[QE] ===> Error creating issue on Jira.\n`)
        })
      break

    // Issue exists, update it
    default:
      // Update
      axios(configUpdate)
        .then((_response) => {
          process.stdout.write(`[QE] ===> Issue updated successfully.\n`)
        })
        .catch((_error) => {
          process.stderr.write(
            `[QE] ===> Error updating the ${JIRA_EXISTENT_KEY} issue.\n`
          )
        })
      break
  }
}

module.exports = { vtexJira: createIssue }
