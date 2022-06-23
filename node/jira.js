const axios = require('axios')

const qe = require('./utils')

// Search issues on Jira
async function searchIssue(account, authorization, JIRA_JQL) {
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
    url: `https://${account}.atlassian.net/rest/api/3/search`,
    headers: {
      Authorization: `Basic ${authorization}`,
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
async function createIssue(vtexJson, projectId, testErrors) {
  // GitHub and Cypress
  const GH_REPO = process.env.GITHUB_REPOSITORY

  if (GH_REPO) {
    const [, GH_PROJECT] = GH_REPO.split('/')
    const [, , GH_REF] = process.env.GITHUB_REF.split('/')
    const GH_RUN = process.env.GITHUB_RUN_ID
    const GH_URL = process.env.GITHUB_SERVER_URL
    const GH_PR = process.env.GITHUB_RUN_NUMBER
    const GH_ACTOR = process.env.GITHUB_ACTOR
    const PR_URL = `${GH_URL}/${GH_REPO}/pull/${GH_REF}`
    const CY_URL = `https://dashboard.cypress.io/projects/${projectId}/runs`
    const RUN_URL = `${GH_URL}/${GH_REPO}/actions/runs/${GH_RUN}`
    // Jira
    const ERRORS = testErrors.join(', ')
    const { account, authorization, issueType } = vtexJson

    // For JIRA, we are on testing phase.
    // So, Instead of creating on particular project board
    // we will create tickets on ENGINEERS board
    const board = 'ENGINEERS'

    const JIRA_SUMMARY = `PR #${GH_PR}: ${GH_PROJECT} E2E test failed`
    const JIRA_JQL =
      `summary ~ "${JIRA_SUMMARY}" AND project = "${board}"` +
      'AND statusCategory IN ("undefined", "In Progress", "To Do")'
    // Payload for ticket creation

    const dataCreation = JSON.stringify({
      fields: {
        project: {
          key: board,
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
          name: issueType,
        },
        // Priority - Lowest, Low, Medium, High, Highest
        priority: {
          name: 'Medium',
        },
        // Bug priority - Must Fix, Should Fix, Unbreak Now
        customfield_10115: {
          value: 'Should Fix',
        },
      },
      update: {},
    })

    // Config for ticket creation
    const configCreation = {
      method: 'post',
      url: `https://${account}.atlassian.net/rest/api/3/issue`,
      headers: {
        Authorization: `Basic ${authorization}`,
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

    process.stdout.write(`[QE] ===> Searching by this issue on Jira...\n`)

    const JIRA_EXISTENT_KEY = await searchIssue(
      account,
      authorization,
      JIRA_JQL
    )

    // Config for ticket update
    const configUpdate = {
      method: 'post',
      url: `https://${account}.atlassian.net/rest/api/3/issue/${JIRA_EXISTENT_KEY}/comment`,
      headers: {
        Authorization: `Basic ${authorization}`,
        'Content-Type': 'application/json',
      },
      data: dataUpdate,
    }

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
        await axios(configCreation)
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
      default: {
        await axios(configUpdate)
          .then((response) => {
            const { status } = response

            process.stdout.write(
              `[QE] ===> Issue update got ${
                status === 201 ? 'success' : 'failed'
              }.\n`
            )
          })
          .catch((_error) => {
            process.stderr.write(
              `[QE] ===> Error updating the ${_error} issue.\n`
            )
          })
        break
      }
    }
  } else {
    qe.msg('Creating JIRA Issue for local tests failure is not allowed')
  }
}

module.exports = { jira: createIssue }
