const fs = require('fs-extra');
const path = require('path');
const util = require('./test_util');

const BROWSER_NAME = 'chrome';
const CUCUMBER_RESULTS_FILE_PATH = path.resolve(process.cwd(), './.tmp/');
const CUCUMBER_RESULTS_FILE_NAME = 'results';
const CUCUMBER_RESULTS = `${CUCUMBER_RESULTS_FILE_PATH}/${CUCUMBER_RESULTS_FILE_NAME}`;
const JSON_OUTPUT_PATH = path.resolve(CUCUMBER_RESULTS_FILE_PATH, 'json-output-folder');
const CUCUMBER_FOO_FEATURE_NAME = 'foo_until_you_bar';
const CUCUMBER_GENERATE_FEATURE_NAME = 'generate_a_json_file';

describe('validate plugin and all the options', () => {
    beforeEach(() => {
        fs.removeSync(CUCUMBER_RESULTS_FILE_PATH);
    });

    it('should create 2 unique json report files with all the defaults', () => {
        const cmd = 'test/cucumber/config/no-options.conf.js';

        return util
            .runOne(cmd)
            .after(() => {
                const cucumberFoo = `${JSON_OUTPUT_PATH}/${CUCUMBER_FOO_FEATURE_NAME}`;
                const cucumberGenerate = `${JSON_OUTPUT_PATH}/${CUCUMBER_GENERATE_FEATURE_NAME}`;
                const cucumberResults = util.findJsonReportFiles(CUCUMBER_RESULTS)[0];
                const fooResults = util.findJsonReportFiles(cucumberFoo)[0];
                const generateResults = util.findJsonReportFiles(cucumberGenerate)[0];
                const fooJson = fs.readJsonSync(fooResults);
                const generateJson = fs.readJsonSync(generateResults);

                // Check original JSON still exists => default `removeOriginalJsonReportFile = false`
                expect(cucumberResults).toEqual(`${CUCUMBER_RESULTS}.json`);

                // Check if the jsonOutputPath is default => `jsonOutputPath: './.tmp/json-output-path/'`
                expect(fooResults).toContain(`${cucumberFoo}.${BROWSER_NAME}`);

                // Check not metadata has been added from the capability
                expect(fooJson[0].metadata.browser.name).toEqual(BROWSER_NAME);
                expect(/(\d+)./.test(fooJson[0].metadata.browser.version)).toEqual(true);
                expect(fooJson[0].metadata.device).toEqual('');
                expect(fooJson[0].metadata.platform.name).toEqual('');
                expect(fooJson[0].metadata.platform.version).toEqual('');

                // Check if the jsonOutputPath is default => `jsonOutputPath: './.tmp/json-output-path/'`
                expect(generateResults).toContain(`${cucumberGenerate}.${BROWSER_NAME}`);

                // Check not metadata has been added from the capability
                expect(generateJson[0].metadata.browser.name).toEqual(BROWSER_NAME);
                expect(/(\d+)./.test(generateJson[0].metadata.browser.version)).toEqual(true);
                expect(generateJson[0].metadata.device).toEqual('');
                expect(generateJson[0].metadata.platform.name).toEqual('');
                expect(generateJson[0].metadata.platform.version).toEqual('');
            })
            .run();
    });

    it('should validate all options and output', () => {
        const cmd = 'test/cucumber/config/full-options.conf.js';
        const jsonOutputPath = path.resolve(process.cwd(), './json-output-path');
        const reportPath = path.resolve(process.cwd(), './report-path');

        // Clear the state
        fs.removeSync(jsonOutputPath);
        fs.removeSync(reportPath);

        return util
            .runOne(cmd)
            .expectOutput('Multiple Cucumber HTML report generated in:')
            .after(() => {
                const cucumberFoo = `${jsonOutputPath}/${CUCUMBER_FOO_FEATURE_NAME}`;
                const cucumberGenerate = `${jsonOutputPath}/${CUCUMBER_GENERATE_FEATURE_NAME}`;
                const cucumberResults = util.findJsonReportFiles(CUCUMBER_RESULTS)[0];
                const fooResults = util.findJsonReportFiles(cucumberFoo)[0];
                const generateResults = util.findJsonReportFiles(cucumberGenerate)[0];
                const fooJson = fs.readJsonSync(fooResults);
                const generateJson = fs.readJsonSync(generateResults);
                const report = path.resolve(`${reportPath}/index.html`);
                const reportMergedJonOutput = path.resolve(`${reportPath}/merged-output.json`);
                const reportEnrichedJsonOutput = path.resolve(`${reportPath}/enriched-output.json`);

                // Check original JSON has been removed => `removeOriginalJsonReportFile = true`
                expect(cucumberResults).not.toBeDefined();

                // Check if the jsonOutputPath has been changed => `jsonOutputPath: './json-output-path/'`
                expect(fooResults).toContain(`${cucumberFoo}.${BROWSER_NAME}`);

                // Check all metadata has been added from the capability
                expect(fooJson[0].metadata.browser.name).toEqual(BROWSER_NAME);
                expect(/(\d+)./.test(fooJson[0].metadata.browser.version)).toEqual(true);
                expect(fooJson[0].metadata.device).toEqual('local development machine');
                expect(fooJson[0].metadata.platform.name).toEqual('osx');
                expect(fooJson[0].metadata.platform.version).toEqual('10.12.6');

                // Check if the jsonOutputPath has been changed => `jsonOutputPath: './json-output-path/'`
                expect(generateResults).toContain(`${cucumberGenerate}.${BROWSER_NAME}`);

                // Check all metadata has been added from the capability
                expect(generateJson[0].metadata.browser.name).toEqual(BROWSER_NAME);
                expect(/(\d+)./.test(generateJson[0].metadata.browser.version)).toEqual(true);
                expect(generateJson[0].metadata.device).toEqual('local development machine');
                expect(generateJson[0].metadata.platform.name).toEqual('osx');
                expect(generateJson[0].metadata.platform.version).toEqual('10.12.6');

                // Check if the report path has been created with the report in it `reportPath: './report-path/'`
                expect(fs.existsSync(report)).toEqual(true);

                // Merged and enriched file has been saved => `saveCollectedJSON: true`
                expect(fs.existsSync(reportMergedJonOutput)).toEqual(true);
                expect(fs.existsSync(reportEnrichedJsonOutput)).toEqual(true);
            })
            .run();
    });

    it('should not print the log', () => {
        const cmd = 'test/cucumber/config/no-log.conf.js';

        return util
            .runOne(cmd)
            .expectOutput('Running 1 instances of WebDriver')
            .run();
    });
});
