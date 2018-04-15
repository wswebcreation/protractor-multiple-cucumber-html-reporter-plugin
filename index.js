'use strict';

const fs = require('fs-extra');
const path = require('path');
const multiCucumberHTLMReporter = require('multiple-cucumber-html-reporter');

let IS_JSON_FORMAT = false;
let PID_INSTANCE_DATA;
const REPORT_FOLDER = 'report';
const METADATA_KEY = 'metadata';
const JSON_OUTPUT_FOLDER = 'json-output-folder';
const PLUGIN_CONFIG = {
    /**
     * multiple-cucumber-html-reporter specific options
     */
    customMetadata: false,
    customStyle: '',
    disableLog: false,
    displayDuration: false,
    durationInMS: false,
    openReportInBrowser: false,
    overrideStyle: '',
    pageFooter: false,
    pageTitle: false,
    reportPath: REPORT_FOLDER,
    saveCollectedJSON: false,

    /**
     * protractor-multiple-cucumber-html-reporter-plugin specific options
     */
    automaticallyGenerateReport: false,
    removeExistingJsonReportFile: false,
    removeOriginalJsonReportFile: false,
    metadataKey: METADATA_KEY,

    /**
     * Used for both modules
     */
    jsonOutputPath: JSON_OUTPUT_FOLDER
};

/**
 * Configures the plugin with the correct data
 *
 * @see docs/plugins.md
 * @returns {Promise} A promise which resolves into a configured setup
 * @public
 */
function setup() {
    return browser.getProcessedConfig()
        .then((configuration) => {
            let cucumberFormat = configuration.cucumberOpts.format;

            IS_JSON_FORMAT = cucumberFormat && cucumberFormat.includes('json');

            if (Array.isArray(cucumberFormat)) {
                IS_JSON_FORMAT = cucumberFormat.find((format) => {
                    cucumberFormat = format;
                    return format.includes('json')
                });
            }

            if (IS_JSON_FORMAT) {
                /**
                 * If options are provided override the values to the PLUGIN_CONFIG object
                 */
                if (this.config.options) {
                    Object.assign(PLUGIN_CONFIG, this.config.options);
                }

                /**
                 * Get the JSON folder path and file name if they are still empty
                 */
                const formatPathMatch = cucumberFormat.match(/(.+):(.+)/);
                const filePathMatch = formatPathMatch[2].match(/(.*)\/(.*)\.json/);

                // Get the cucumber results path
                PLUGIN_CONFIG.cucumberResultsPath = filePathMatch[1];

                // Get the cucumber report name
                PLUGIN_CONFIG.cucumberReportName = filePathMatch[2];

                /**
                 * If the json output folder is still default, then create a new one
                 */
                if (PLUGIN_CONFIG.jsonOutputPath === JSON_OUTPUT_FOLDER) {
                    PLUGIN_CONFIG.jsonOutputPath = path.join(PLUGIN_CONFIG.cucumberResultsPath, JSON_OUTPUT_FOLDER);
                }

                /**
                 * Check whether the file name need to be unique
                 */
                PLUGIN_CONFIG.uniqueReportFileName = (Array.isArray(configuration.multiCapabilities)
                    && configuration.multiCapabilities.length > 0)
                    || typeof configuration.getMultiCapabilities === 'function'
                    || configuration.capabilities.shardTestFiles;

                /**
                 * Prepare the PID_INSTANCE_DATA
                 */
                const metadata = {
                    browser: {
                        name: '',
                        version: ''
                    },
                    device: '',
                    platform: {
                        name: '',
                        version: ''
                    }
                };

                PID_INSTANCE_DATA = {
                    pid: process.pid,
                    metadata: Object.assign(metadata, configuration.capabilities[PLUGIN_CONFIG.metadataKey] || {})
                };

                /**
                 * Create the needed folders if they are not present
                 */
                fs.ensureDirSync(PLUGIN_CONFIG.cucumberResultsPath);
                fs.ensureDirSync(PLUGIN_CONFIG.jsonOutputPath);
            } else {
                console.warn('\n### NO `JSON` FORMAT IS SPECIFIED IN THE PROTRACTOR CONF FILE UNDER `cucumberOpts.format ###`\n');
            }
        });
}

/**
 * Enrich the instance data
 *
 * @see docs/plugins.md
 * @returns {Promise} A promise which resolves in a enriched instance data object
 * @public
 */
function onPrepare() {
    if (IS_JSON_FORMAT) {
        return browser.getCapabilities()
            .then((capabilities) => {
                PID_INSTANCE_DATA.metadata.browser.name = PID_INSTANCE_DATA.metadata.browser.name === ''
                    ? capabilities.get('browserName').toLowerCase()
                    : PID_INSTANCE_DATA.metadata.browser.name;
                PID_INSTANCE_DATA.metadata.browser.version = (capabilities.get('version') || capabilities.get('browserVersion'))
                    || PID_INSTANCE_DATA.metadata.browser.version;
            });
    }
}

/**
 * When a report file has been made by CucumberJS, parse it by
 *  - cutting it up to a file per feature
 *  - adding the instance data to it.
 *
 * @see docs/plugins.md
 * @public
 */
function postResults() {
    if (IS_JSON_FORMAT) {
        const reportPath = `${path.join(PLUGIN_CONFIG.cucumberResultsPath, PLUGIN_CONFIG.cucumberReportName)}.json`;
        const pidReportPath = `${path.join(
            PLUGIN_CONFIG.cucumberResultsPath,
            PLUGIN_CONFIG.cucumberReportName
        )}.${PID_INSTANCE_DATA.pid}.json`;

        if ((!PLUGIN_CONFIG.uniqueReportFileName && fs.existsSync(reportPath))
            || (PLUGIN_CONFIG.uniqueReportFileName && fs.existsSync(pidReportPath))
        ) {
            const currentReportPath = PLUGIN_CONFIG.uniqueReportFileName ? pidReportPath : reportPath;
            const currentReport = fs.readJsonSync(currentReportPath);

            currentReport.map((singleReport) => {
                const featureName = singleReport.name.replace(/\s+/g, '_').replace(/\W/g, '').toLowerCase() || 'noName';
                const browserVersion = PID_INSTANCE_DATA.metadata.browser.version === ''
                    ? ''
                    : `.${PID_INSTANCE_DATA.metadata.browser.version}`;
                const plaformName = PID_INSTANCE_DATA.metadata.platform.name === ''
                    ? ''
                    : `.${PID_INSTANCE_DATA.metadata.platform.name}`;
                const plaformVersion = PID_INSTANCE_DATA.metadata.platform.version === ''
                    ? ''
                    : `.${PID_INSTANCE_DATA.metadata.platform.version}`;
                let fileName = `${featureName}.${PID_INSTANCE_DATA.metadata.browser.name}`;

                fileName += browserVersion + plaformName + plaformVersion;
                const filePath = path.join(PLUGIN_CONFIG.jsonOutputPath, `${fileName}_${Date.now()}.json`);

                /**
                 * If needed remove the previous file if it exists to prevent double reports of 1 feature + browser execution
                 */
                if (PLUGIN_CONFIG.removeExistingJsonReportFile) {
                    fs.readdirSync(PLUGIN_CONFIG.jsonOutputPath)
                        .filter((file) => file.match(new RegExp(fileName, 'ig')))
                        .forEach((file) => fs.removeSync(path.resolve(PLUGIN_CONFIG.jsonOutputPath, file)));
                }

                /**
                 * Add the metadata from the running instance to the report
                 */
                singleReport.metadata = PID_INSTANCE_DATA.metadata;

                /**
                 * Save the file
                 */
                fs.writeJsonSync(filePath, JSON.parse(`[${ JSON.stringify(singleReport) }]`), { spaces: 2 });
            });

            /**
             * Remove the original json report file, defined in the `cucumberOpts.format` if needed
             */
            if (PLUGIN_CONFIG.removeOriginalJsonReportFile) {
                fs.removeSync(currentReportPath);
            }

            if ((PLUGIN_CONFIG.customData || PLUGIN_CONFIG.reportName) && !PLUGIN_CONFIG.automaticallyGenerateReport) {
                console.warn(`
===========================================================================
    YOU ADDED A CUSTOM reportName AND OR ADDED A cucsomerData-object
    WITHOUT SETTING 'automaticallyGenerateReport: true'.
    
    !!!THIS WILL NOT RESULT IN SETTING THE CUSTOM DATA IN THE REPORT!!!                
===========================================================================`);
            }

            /**
             * Generate the HTML report if needed
             */
            if (PLUGIN_CONFIG.automaticallyGenerateReport) {
                /**
                 * If the reportPath is still default, then add the default folder to the same folder
                 * where the results are stored
                 */
                if (PLUGIN_CONFIG.reportPath === REPORT_FOLDER) {
                    PLUGIN_CONFIG.reportPath = path.join(PLUGIN_CONFIG.cucumberResultsPath, REPORT_FOLDER);
                }

                const multiCucumberHTLMReporterConfig = {
                    customMetadata: PLUGIN_CONFIG.customMetadata,
                    displayDuration: PLUGIN_CONFIG.displayDuration,
                    durationInMS: PLUGIN_CONFIG.durationInMS,
                    disableLog: PLUGIN_CONFIG.disableLog,
                    jsonDir: PLUGIN_CONFIG.jsonOutputPath,
                    openReportInBrowser: PLUGIN_CONFIG.openReportInBrowser,
                    reportPath: PLUGIN_CONFIG.reportPath,
                    saveCollectedJSON: PLUGIN_CONFIG.saveCollectedJSON
                };

                /**
                 * Add the custom data if needed
                 */
                if (PLUGIN_CONFIG.customData) {
                    multiCucumberHTLMReporterConfig.customData = PLUGIN_CONFIG.customData;
                }

                /**
                 * Add the custom css if needed
                 */
                if (PLUGIN_CONFIG.customStyle !== '') {
                    multiCucumberHTLMReporterConfig.customStyle = PLUGIN_CONFIG.customStyle;
                }

                /**
                 * Add the override css if needed
                 */
                if (PLUGIN_CONFIG.overrideStyle !== '') {
                    multiCucumberHTLMReporterConfig.overrideStyle = PLUGIN_CONFIG.overrideStyle;
                }

                /**
                 * Add the pageFooter if needed
                 */
                if (PLUGIN_CONFIG.pageFooter) {
                    multiCucumberHTLMReporterConfig.pageFooter = PLUGIN_CONFIG.pageFooter;
                }

                /**
                 * Add the pageTitle if needed
                 */
                if (PLUGIN_CONFIG.pageTitle) {
                    multiCucumberHTLMReporterConfig.pageTitle = PLUGIN_CONFIG.pageTitle;
                }

                /**
                 * Add the custom report name if needed
                 */
                if (PLUGIN_CONFIG.reportName) {
                    multiCucumberHTLMReporterConfig.reportName = PLUGIN_CONFIG.reportName;
                }

                multiCucumberHTLMReporter.generate(multiCucumberHTLMReporterConfig);
            }
        } else {
            console.warn(`\n### File: '${reportPath}' or '${pidReportPath}' is not present! ###\n`);
        }
    }
}

// Exports
exports.onPrepare = onPrepare;
exports.postResults = postResults;
exports.setup = setup;
