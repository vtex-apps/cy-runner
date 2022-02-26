/**********************************************
 Validate schema on cy-runner.yml
 Test only mandatory fields cy-runner works
 0 = String not null
 1 = Integer not null
 2 = Boolean not null
 3 = String
 4 = Integer
 5 = Boolean
 6 = Not null
 7 = array
 **********************************************/
const {get} = require('lodash')
const qe = require('./utils')

exports.validate = (config) => {
    const SCHEMA = {
        secretName: 0,
        testConfig: {
            devMode: 2,
            runHeaded: 2,
            authVtexCli: {enabled: 2, git: 0, branch: 0},
            vtex: {account: 0, id: 4, domain: 0},
            cypress: {
                enabled: 2,
                projectId: 0,
                video: 2,
                videoCompression: 6,
                videoUploadOnPasses: 2,
                screenshotOnRunFailure: 2,
                trashAssetsBeforeRuns: 2,
                viewportWidth: 1,
                viewportHeight: 1,
                defaultCommandTimeout: 1,
                requestTimeout: 1,
                watchForFileChanges: 2,
                pageLoadTimeout: 1,
                browser: 0,
                chromeWebSecurity: 2,
            },
            jira: {enabled: 2, account: 0, board: 0, issueType: 0},
            slack: {enabled: 2, channel: 3},
            stateFiles: 7,
        },
        testWorkspace: {
            name: 3,
            setup: {
                enabled: 2,
                stopOnFail: 2,
                path: 0,
                file: 0,
                manageApps: {
                    enabled: 2,
                    link: 0,
                    install: 7,
                    uninstall: 7,
                },
            },
            wipe: {enabled: 2, stopOnFail: 2, path: 0, file: 0},
            teardown: {enabled: 2, stopOnFail: 2, path: 0, file: 0},
        }
    }
    const STRATEGY = {
        testStrategy: {
            '*': {
                enabled: 2,
                sendDashboard: 2,
                stopOnFail: 2,
                hardTries: 1,
                parallel: 2,
            }
        },
    }

    // Traverse SCHEMA
    const traverse = (result, obj, previousKey) => {
        if (typeof obj == 'object') {
            for (const key in obj)
                traverse(result, obj[key], (previousKey || '') + (previousKey ? '.' + key : key))
        } else {
            result.push({
                key: previousKey || '',
                type: obj,
            })
        }
        return result
    }

    // Ignore check on disabled items
    let skip = []
    const ignore = (key, value) => {
        let byPass = null
        if (/\.enabled/.test(key) && !value) {
            skip.push(key.split('.enabled')[0])
        }
        skip.forEach((disabled) => {
            byPass = !!key.includes(disabled)
        })
        return byPass
    }

    // Validate SCHEMA
    const SCHEMA_TRAVERSED = traverse([], SCHEMA)
    SCHEMA_TRAVERSED.forEach((check) => {
        let value = get(config, check.key)
        let crash = false
        let msg = 'not null'
        if (ignore(check.key, value)) return
        // Check values can't be null
        if (check.type in [0, 1, 2, 6] && value == null) crash = true
        switch (check.type) {
            // String
            case 3:
                msg = 'string'
                if (value != null && typeof value != 'string') crash = true
                break
            // Integer
            case 4:
                msg = 'number'
                if (value != null && typeof value != 'number') crash = true
                break
            // Boolean
            case 5:
                msg = 'boolean'
                if (value != null && typeof value != 'boolean') crash = true
                break
            // // Array
            // case 7:
            //     msg = msg + 'array]'
            //     if (!value.constructor.prototype.hasOwnProperty('push')) crash = true
            //     break
            default:
                break
        }
        if (crash) qe.crash(`Parse cy-runner.yml failed [${check.key} must be ${msg}]`)
    })
    console.log(skip)

    // Validate test strategy
    skip = []
    const STRATEGY_TRAVERSED = traverse([], STRATEGY)


    process.exit(0)
}