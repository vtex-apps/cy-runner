const fs = require('fs')
const path = require('path')

const jsYaml = require('js-yaml')

const system = require('./system')
const logger = require('./logger')
const schema = require('./schema')

exports.read = (file) => {
  try {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  } catch (e) {
    system.crash(`Failed to read the ${file}`, e)
  }
}

exports.size = (file) => {
  try {
    return fs.statSync(file).size
  } catch (e) {
    system.crash(`Failed to get size of ${file}`, e)
  }
}

exports.copy = (source, destination) => {
  try {
    return fs.copyFileSync(source, destination)
  } catch (e) {
    system.crash(`Failed to copy ${source} to ${destination}`, e)
  }
}

exports.link = (source, destination) => {
  try {
    return fs.symlinkSync(source, destination)
  } catch (e) {
    system.crash(`Failed to link ${source} to ${destination}`, e)
  }
}

exports.exists = (fileOrDirectory) => {
  try {
    return !!fs.existsSync(fileOrDirectory)
  } catch (e) {
    system.crash(`Failed to check ${fileOrDirectory}`, e)
  }
}

exports.append = (msg, file) => {
  try {
    return fs.appendFileSync(file, msg)
  } catch (e) {
    system.crash(`Failed to append ${msg} to ${file}`, e)
  }
}

exports.write = (msg, file) => {
  try {
    return fs.writeFileSync(file, msg)
  } catch (e) {
    system.crash(`Failed to create ${file}`, e)
  }
}

exports.delete = (fileOrDirectory) => {
  try {
    if (this.exists(fileOrDirectory)) return fs.rmSync(fileOrDirectory)
  } catch (e) {
    system.crash(`Failed to delete ${fileOrDirectory}`, e)
  }
}

exports.makeDir = (directory) => {
  try {
    if (!this.exists(directory)) return fs.mkdirSync(directory)
  } catch (e) {
    system.crash(`Failed to create ${directory}`, e)
  }
}

exports.readYaml = (jsonFile) => {
  try {
    return jsYaml.load(this.read(jsonFile, 'utf-8'))
  } catch (e) {
    system.crash(`Invalid JSON/YAML file: ${jsonFile}`, e)
  }
}

exports.loadConfig = (yamlFile) => {
  const parentYamlFile = path.join('..', yamlFile)

  if (this.exists(parentYamlFile)) yamlFile = parentYamlFile
  if (!this.exists(yamlFile)) system.crash(`${yamlFile} not found`)

  try {
    const data = this.read(yamlFile)
    const config = jsYaml.load(data)

    schema.validateConfig(config)
      ? logger.msgOk(`${yamlFile} validated successfully`)
      : system.crash(`Unknown error loading ${yamlFile}`)

    return config
  } catch (e) {
    system.crash(`Invalid ${yamlFile}`, e)
  }
}

exports.writeJson = (config, jsonFile) => {
  try {
    this.write(jsonFile, JSON.stringify(config))
    logger.msgOk(`${jsonFile} saved`)
  } catch (e) {
    system.crash(`Failed to create ${jsonFile}`, e)
  }
}

exports.createStateFiles = (config) => {
  try {
    const { stateFiles } = config.base
    const SIZE = stateFiles.length
    const PLURAL = SIZE > 1 ? 'files' : 'file'

    if (SIZE) {
      this.msg(`Creating state ${PLURAL}`, 'warn')
      stateFiles.forEach((stateFile) => {
        this.msg(stateFile, true, true)
        fs.writeFileSync(stateFile, '{}')
      })
    }
  } catch (e) {
    this.crash('Fail to create a empty state file', e)
  }
}

// ENGINEERS-465
exports.keepStateFiles = (config) => {
  try {
    const { stateFiles } = config.base

    this.msg(`Keeping state files`, 'warn')
    stateFiles.forEach((stateFile) => {
      this.msg(`${stateFile} -> logs/${stateFile}`, true, true)
      fs.copyFileSync(stateFile, `logs/${stateFile}`)
    })
  } catch (e) {
    this.crash('Fail to keep state files', e)
  }
}
