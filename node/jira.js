const axios = require('axios')

const qe = require('./utils')

module.exports.issue = async (config, specsFailed) => {
  qe.msgSection('Jira integration')

  // GitHub and Cypress
  const JIRA = config.base.jira
  const CI = process.env.CI ?? false
  const GH_REPO = process.env.GITHUB_REPOSITORY ?? 'example/App-Teste'
  const GITHUB_REF = process.env.GITHUB_REF ?? 'refs/pull/77/merge'
  const [, GH_PROJECT] = GH_REPO.split('/')
  const [, , GH_REF] = GITHUB_REF.split('/')
  const GH_RUN = process.env.GITHUB_RUN_ID ?? 7777777777
  const GH_URL = process.env.GITHUB_SERVER_URL ?? 'https://github.com'
  const GH_PR = process.env.GITHUB_RUN_NUMBER ?? 7
  const GH_ACTOR = process.env.GITHUB_ACTOR ?? 'cy-runner'
  const PR_URL = `${GH_URL}/${GH_REPO}/pull/${GH_REF}`
  const CY_URL = `https://dashboard.cypress.io/projects/${config.base.cypress.projectId}/runs`
  const RUN_URL = `${GH_URL}/${GH_REPO}/actions/runs/${GH_RUN}`

  // Jira - You can set config.base.jira.testing as true for tests
  JIRA.board = JIRA.testing || !CI ? 'ENGINEERS' : JIRA.board
  const SUMMARY = `PR #${GH_PR}: ${GH_PROJECT} E2E test failed`
  const JQL = `summary ~ "${SUMMARY}" AND project = "${JIRA.board}" AND statusCategory IN ("undefined", "In Progress", "To Do")`
  const PRIORITY = JIRA.priority ?? 'High'
  const JIRA_KEY = await searchIssue(JIRA.account, JIRA.authorization, JQL)

  // Payload for ticket creation
  const TICKET_CREATION = JSON.stringify({
    fields: {
      project: {
        key: JIRA.board,
      },
      summary: SUMMARY,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Cypress test for ',
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
                text: ` created by ${GH_ACTOR} failed on tests ${specsFailed.join()}.`,
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
        name: JIRA.issueType,
      },
      // Priority - Lowest, Low, Medium, High, Highest
      priority: {
        name: PRIORITY,
      },
      // Bug priority - Must Fix, Should Fix, Unbreak Now
      customfield_10115: {
        value: 'Should Fix',
      },
    },
    update: {},
  })

  const CFG_TICKET_CREATION = {
    method: 'post',
    url: `https://${JIRA.account}.atlassian.net/rest/api/3/issue`,
    headers: {
      Authorization: `Basic ${JIRA.authorization}`,
      'Content-Type': 'application/json',
    },
    SEARCH: TICKET_CREATION,
  }

  // Payload for ticket update
  const TICKET_UPDATE = JSON.stringify({
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
              text: ` failed again on tests ${specsFailed.join()}.`,
            },
          ],
        },
      ],
    },
    visibility: null,
  })

  const CFG_TICKET_UPDATE = {
    method: 'post',
    url: `https://${JIRA.account}.atlassian.net/rest/api/3/issue/${JIRA_KEY}/comment`,
    headers: {
      Authorization: `Basic ${JIRA.authorization}`,
      'Content-Type': 'application/json',
    },
    SEARCH: TICKET_UPDATE,
  }

  // Update or create the issue
  const CFG = JIRA_KEY ? CFG_TICKET_UPDATE : CFG_TICKET_CREATION

  await axios(CFG)
    .then((response) => {
      const { key: ISSUE_KEY } = response.SEARCH

      qe.msg(`Issue ${ISSUE_KEY} created on Jira`, 'ok', false, false)
    })
    .catch((e) => {
      qe.msg('Error creating or updating issue', 'error', false, false)
      qe.msg(e, true, true, false)
    })
}

// Search issues on Jira
async function searchIssue(account, authorization, jiraJQL) {
  let key = 0
  const SEARCH = JSON.stringify({
    expand: [],
    jql: jiraJQL,
    maxResults: 1,
    fieldsByKeys: false,
    fields: ['summary', 'status', 'assignee'],
    startAt: 0,
  })

  // Configuration
  const CFG_SEARCH = {
    method: 'post',
    url: `https://${account}.atlassian.net/rest/api/3/search`,
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/json',
    },
    SEARCH,
  }

  await axios(CFG_SEARCH)
    .then((response) => {
      if (response.data.total) {
        key = response.data.issues[0].key
        qe.msg(`Issue ${key} found, it'll be updated`, 'warn')
      } else {
        qe.msg(`Issue not found, it'll be created`, 'ok')
      }
    })
    .catch((e) => {
      qe.msg('Error consuming Jira API', 'error')
      qe.msg(e, true, true, false)
    })

  return key
}
