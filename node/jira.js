const axios = require('axios')

const qe = require('./utils')

module.exports.issue = async (config, specsFailed, runUrl) => {
  qe.msgSection('Jira integration')

  // GitHub and Cypress
  const JIRA = config.base.jira
  const CI = process.env.CI ?? false
  const GH_REPO = process.env.GITHUB_REPOSITORY ?? 'example/App-Teste'
  const GITHUB_REF = process.env.GITHUB_REF ?? 'refs/pull/77/merge'
  const [, , GH_REF] = GITHUB_REF.split('/')
  const GH_RUN = process.env.GITHUB_RUN_ID ?? 7777777777
  const GH_URL = process.env.GITHUB_SERVER_URL ?? 'https://github.com'
  const GH_PR = process.env.GITHUB_RUN_NUMBER ?? 0
  const GH_ACTOR = process.env.GITHUB_ACTOR ?? 'cy-runner'
  const PR_URL = `${GH_URL}/${GH_REPO}/pull/${GH_REF}`
  const CY_URL = `https://dashboard.cypress.io/projects/${config.base.cypress.projectId}/runs`
  const RUN_URL = `${GH_URL}/${GH_REPO}/actions/runs/${GH_RUN}`
  const IS_SCH = process.env.GITHUB_EVENT_NAME === 'schedule' ?? false
  const IS_DIS = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' ?? false

  // If DISPATCH, avoid any ticket creation
  if (IS_DIS) {
    qe.msg('Running as dispatch, skipping any ticket creation', 'ok')

    return
  }

  // If LOCAL, avoid any ticket creation
  if (!CI) {
    qe.msg('Running locally, skipping any ticket creation', 'ok')

    return
  }

  // Jira - You can set config.base.jira.testing as true for tests
  JIRA.board = JIRA.testing || IS_SCH ? 'ENGINEERS' : JIRA.board
  const SUMMARY = IS_SCH ? `SCHEDULE ${GH_REPO}:` : `PR #${GH_REF}:`
  const JQL = `summary ~ '${SUMMARY}' AND project = '${JIRA.board}' AND statusCategory IN ('undefined', 'In Progress', 'To Do')`
  const PRIORITY = JIRA.priority ?? 'High'
  const JIRA_KEY = await searchIssue(JIRA.account, JIRA.authorization, JQL)

  // Prepare failures with links
  const FAILURES = []
  let MARKS = []

  if (typeof runUrl !== 'undefined') {
    MARKS = [
      {
        type: 'link',
        attrs: {
          href: `${runUrl}/test-results?statuses=[{"value":"FAILED","label":"FAILED"}]`,
        },
      },
    ]
  }

  specsFailed.forEach((fail) => {
    FAILURES.push({
      type: 'text',
      text: `\n==> ${fail}`,
      marks: MARKS,
    })
  })

  // Payload for ticket creation
  const ADD_ISSUE = JSON.stringify({
    fields: {
      project: {
        key: JIRA.board,
      },
      summary: `${SUMMARY} E2E test failed for ${GH_REPO}`,
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
                text: `${SUMMARY} ${GH_REF}`,
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
                text: ` created by ${GH_ACTOR} failed on\n`,
              },
              ...FAILURES,
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '\nTo get more information about the errors, please take a look at ',
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

  const CFG_ADD_ISSUE = {
    method: 'post',
    url: `https://${JIRA.account}.atlassian.net/rest/api/3/issue`,
    headers: {
      Authorization: `Basic ${JIRA.authorization}`,
      'Content-Type': 'application/json',
    },
    params: {
      updateHistory: true,
      applyDefaultValues: false,
    },
    data: ADD_ISSUE,
  }

  // Payload for ticket update
  const UPDATE_ISSUE = JSON.stringify({
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
              text: `${SUMMARY} ${GH_REF}`,
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
              text: ` failed again on:`,
            },
            ...FAILURES,
          ],
        },
      ],
    },
    visibility: null,
  })

  const CFG_UPDATE_ISSUE = {
    method: 'post',
    url: `https://${JIRA.account}.atlassian.net/rest/api/3/issue/${JIRA_KEY}/comment`,
    headers: {
      Authorization: `Basic ${JIRA.authorization}`,
      'Content-Type': 'application/json',
    },
    data: UPDATE_ISSUE,
  }

  // Update or create the issue
  let CFG = null
  let MSG = null
  let KEY = null

  switch (JIRA_KEY) {
    case 'abort':
      qe.msg('Issue creation skipped due an JQL error', 'error')

      return

    case 'create':
      CFG = CFG_ADD_ISSUE
      MSG = 'create'
      break

    default:
      CFG = CFG_UPDATE_ISSUE
      MSG = 'update'
  }

  await axios(CFG)
    .then((response) => {
      const { key: ISSUE_KEY } = response.data

      KEY = typeof ISSUE_KEY === 'undefined' ? JIRA_KEY : ISSUE_KEY
      const URL = `https://${JIRA.account}.atlassian.net/browse/${KEY}`

      qe.msg(`Issue ${KEY} ${MSG}d`, 'ok', false, false)
      qe.msg(URL, true, true)
    })
    .catch((e) => {
      qe.msg(`Fail to ${MSG} issue`, 'error', false, false)
      qe.msg(e, true, true, false)
    })
}

// Search issues on Jira
async function searchIssue(account, authorization, jiraJQL) {
  let key = null

  // Configuration
  const CFG = {
    method: 'get',
    url: `https://${account}.atlassian.net/rest/api/3/search`,
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/json',
    },
    params: {
      jql: jiraJQL,
      startAt: 0,
      maxResults: 2,
    },
  }

  await axios(CFG)
    .then((response) => {
      if (response.data.total === 1) {
        key = response.data.issues[0].key
        qe.msg(`Opened issue ${key} found, it'll be updated`, 'warn')
      } else if (response.data.total > 1) {
        key = 'abort'
        qe.msg('More than one issue found, aborting', 'error')
        qe.msg(`JQL used: ${jiraJQL}`)
      } else {
        key = 'create'
        qe.msg(`Issue not found, it'll be created`, 'ok')
      }
    })
    .catch((e) => {
      qe.msg('Querying Jira API', 'error')
      qe.msg(e, true, true, false)
    })

  return key
}
