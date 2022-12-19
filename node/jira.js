const axios = require('axios')

const logger = require('./logger')
const system = require('./system')

module.exports.issue = async (config, specsFailed, runUrl) => {
  logger.msgSection('Jira ticket automation', true)

  const {
    GITHUB_REPOSITORY,
    GITHUB_REF,
    GITHUB_RUN_ID,
    GITHUB_SERVER_URL,
    GITHUB_ACTOR,
  } = process.env

  const JIRA = config.base.jira
  const [, , GH_REF] = GITHUB_REF.split('/')
  const PR_URL = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/pull/${GH_REF}`
  const CY_URL = `https://dashboard.cypress.io/projects/${config.base.cypress.projectId}/runs`
  const RUN_URL = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
  const IS_SCH = process.env.GITHUB_EVENT_NAME === 'schedule' ?? false
  const IS_DIS = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' ?? false
  const IS_FRK = typeof GH_REF !== 'number'

  // If DISPATCH, avoid any ticket creation
  if (IS_DIS) {
    logger.msgWarn('It was triggered by dispatch, skipping ticket creation')

    return
  }

  // If LOCAL, avoid any ticket creation
  if (!system.isCI()) {
    logger.msgWarn('Not on CI, skipping ticket creation')

    return
  }

  // Jira - You can set config.base.jira.testing as true for tests
  // JIRA.board = JIRA.testing || IS_SCH ? 'ENGINEERS' : JIRA.board
  JIRA.board = 'ENGINEERS'
  const PR = IS_FRK ? 'FORK' : `PR #${GH_REF}`
  const SUMMARY = IS_SCH ? `SCHEDULE ${GITHUB_REPOSITORY}:` : `${PR}:`
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
      summary: `${SUMMARY} E2E test failed for ${GITHUB_REPOSITORY}`,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'E2E test ',
              },
              {
                type: 'text',
                text: `${SUMMARY}`,
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
                text: ` ${
                  IS_FRK ? 'authorized' : 'created'
                } by ${GITHUB_ACTOR}; failed on\n`,
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
      logger.msgError('Error on the JQL')
      logger.msgPad(JQL)

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

      logger.msgOk(`Issue ${KEY} ${MSG}d`, true)
      logger.msgPad(URL, true)
    })
    .catch((e) => {
      logger.msgError(`Failed to ${MSG} issue`, true)
      logger.msgPad(e, true)
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
        logger.msgOk(`Opened issue ${key} found`)
      } else if (response.data.total > 1) {
        key = 'abort'
        logger.msgError('More than one issue found')
        logger.msgPad(jiraJQL)
      } else {
        key = 'create'
        logger.msgWarn('A new issue will be created')
      }
    })
    .catch((e) => {
      logger.msgError('Querying Jira API')
      logger.msgPad(e)
    })

  return key
}
