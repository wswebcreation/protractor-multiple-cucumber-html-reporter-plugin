const path = require('path');

exports.config = {

    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),
    cucumberOpts: {
        require: [
            path.resolve(process.cwd(), './test/cucumber/**/*steps.js')
        ],
        format: 'json:.tmp/results.json',
        strict: true
    },

    specs: [
        path.resolve(process.cwd(), './test/cucumber/**/*.feature')
    ],

    capabilities: {
        browserName: 'chrome',
        shardTestFiles: false,
        maxInstances: 2,
        chromeOptions: {
            args: ['disable-infobars']
        }
    }
};
