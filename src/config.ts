import yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('Config');

export class Config {
    debugLogging = 'debug';
    'server.port' = '8081';

    constructor(properties) {
        this.addAll(properties);
    }

    public get(key: string): any {
        return this[key];
    }

    public getClientPath(): string {
        return path.join(__dirname, '../dist/classes/static');
    }
    public addAll(properties): any {
        properties = objectToArray(properties);
        for (const property in properties) {
            if (properties.hasOwnProperty(property)) {
                this[property] = properties[property];
            }
        }
        this.postProcess();
    }

    public postProcess(): any {
        const variables = { ...this, ...process.env };
        for (const property in this) {
            if (this.hasOwnProperty(property)) {
                const value = this[property];
                const processedValue = this.processTemplate(value, variables);
                this[property] = processedValue;
            }
        }
    }

    private processTemplate(template, variables): any {
    // console.log(template);
        if (typeof template === 'string') {
            return template.replace(new RegExp('\\${[^{]+}', 'g'), name => variables[name.substring(2, name.length - 1)]);
        }
        return template;
    }
}

const yamlConfigPath = path.join(__dirname, 'config', 'application.yml');
const envYamlConfigPath = path.join(__dirname, 'config', `application-${process.env.NODE_ENV}.yml`);

const yamlConfig = yaml.safeLoad(fs.readFileSync(yamlConfigPath, 'utf8'));
logger.log(`Actual process.env.NODE_ENV value: ${process.env.NODE_ENV}`);
logger.log('Standard allowed values are: dev, test or prod');
if (!fs.existsSync(envYamlConfigPath)) {
    logger.error(
        'does not exist under your config folder an application-{process.env.NODE_ENV}.yml file with your process.env.NODE_ENV value'
    );
}
const envYamlConfig = yaml.safeLoad(fs.readFileSync(envYamlConfigPath, 'utf8'));

const config = new Config({ ...objectToArray(yamlConfig), ...objectToArray(envYamlConfig), ipAddress: ipAddress() });

export { config };

function objectToArray(source, currentKey?, target?): any {
    target = target || {};
    for (const property in source) {
        if (source.hasOwnProperty(property)) {
            const newKey = currentKey ? currentKey + '.' + property : property;
            const newVal = source[property];

            if (typeof newVal === 'object') {
                objectToArray(newVal, newKey, target);
            } else {
                target[newKey] = newVal;
            }
        }
    }
    return target;
}

function ipAddress(): any {
    const interfaces = require('os').networkInterfaces();
    for (const dev in interfaces) {
        if (interfaces.hasOwnProperty(dev)) {
            const iface = interfaces[dev];
            for (const alias of iface) {
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }

    return null;
}
