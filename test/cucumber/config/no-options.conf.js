const path = require('path');
const config = require('./protractor.shared.conf').config;

config.capabilities = {
    'browserName': 'chrome',
    'shardTestFiles': false,
    'maxInstances': 2,
    'goog:chromeOptions': {
        args: ['--headless']
    },
    'deviceProperties': {
        browser: {
            name: 'chrome',
            version: 'latest'
        },
        device: 'local development machine',
        platform: {
            name: 'osx',
            version: '10.12.6'
        }
    }
};

config.plugins = [{
    path: path.resolve(process.cwd(), './')
}];

exports.config = config;
