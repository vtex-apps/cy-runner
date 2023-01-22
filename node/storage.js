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

exports.unLink = (source) => {
  try {
    return fs.unlinkSync(source)
  } catch (e) {
    system.crash(`Failed to unlink ${source}`, e)
  }
}

exports.exists = (fileOrDirectory) => {
  try {
    return fs.existsSync(fileOrDirectory)
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

exports.delete = (file) => {
  try {
    if (this.exists(file)) return fs.rmSync(file, { recursive: true })
  } catch (e) {
    system.crash(`Failed to delete ${file}`, e)
  }
}

exports.makeDir = (directory) => {
  try {
    if (!this.exists(directory)) return fs.mkdirSync(directory)
  } catch (e) {
    // TODO: Fix the error when got error creating logs folder
    // If the dir to be create = logs, the error will be in loop
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
  // Check if you are inside cy-runner
  logger.msgOk('Checking base path')
  if (this.exists(path.join(system.rootPath(), 'cy-runner'))) {
    system.crash('You must be inside cy-runner folder')
  }

  // Fill full path for yaml config
  yamlFile = path.join(system.basePath(), yamlFile)
  const parentYamlFile = path.join(system.rootPath(), yamlFile)

  if (this.exists(parentYamlFile)) yamlFile = parentYamlFile
  if (!this.exists(yamlFile)) system.crash(`${yamlFile} not found`)

  try {
    const data = this.read(yamlFile)
    const config = jsYaml.load(data)

    schema.validateConfig(config)
      ? logger.msgPad(yamlFile.replace(system.rootPath(), '.'))
      : system.crash(`Unknown error loading ${yamlFile}`)

    return config
  } catch (e) {
    system.crash(`Invalid ${yamlFile.replace(system.rootPath(), '.')}`, e)
  }
}

exports.writeJson = (config, jsonFile) => {
  try {
    this.write(JSON.stringify(config), jsonFile)
    logger.msgPad(jsonFile.replace(system.basePath(), '.'))
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
      logger.msgOk(`Creating state ${PLURAL}`)
      stateFiles.forEach((stateFile) => {
        logger.msgPad(stateFile)
        this.write('{}', path.join(system.cyRunnerPath(), stateFile))
      })
    }
  } catch (e) {
    system.crash('Failed to create a state file', e)
  }
}

// ENGINEERS-465
exports.keepStateFiles = (config) => {
  try {
    const { stateFiles } = config.base

    logger.msgWarn('Moving state files')
    stateFiles.forEach((stateFile) => {
      const SRC = path.join(system.cyRunnerPath(), stateFile)
      const DST = path.join(logger.logPath(), stateFile)

      logger.msgPad(`${stateFile} -> ${DST.replace(system.basePath(), '.')}`)

      this.copy(SRC, DST)
    })
    logger.msgOk('State files moved successfully')
  } catch (e) {
    system.crash('Failed to keep state files', e)
  }
}
