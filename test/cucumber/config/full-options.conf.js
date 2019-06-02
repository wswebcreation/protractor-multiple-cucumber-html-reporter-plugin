const path = require('path');
const config = require('./protractor.shared.conf').config;

config.multiCapabilities = [{
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
}];

config.plugins = [{
    path: path.resolve(process.cwd(), './'),
    options: {
        automaticallyGenerateReport: true,
        jsonOutputPath: './json-output-path/',
        metadataKey: 'deviceProperties',
        reportPath: './report-path/',
        removeExistingJsonReportFile: true,
        removeOriginalJsonReportFile: true,
        saveCollectedJSON: true,
        reportName: 'You can adjust this report name',
        pageFooter: '<div><p>A custom page footer</p></div>',
        pageTitle: 'A custom page title',
        customData: {
            title: 'Run info',
            data: [
                { label: 'Project', value: 'Custom project' },
                { label: 'Release', value: '1.2.3' }
            ]
        },
        displayDuration: true,
        customMetadata: true,
        customStyle: path.join(__dirname, './../../css/custom.css'),
        overrideStyle: path.join(__dirname, './../../css/override.css')
    }
}];

exports.config = config;
