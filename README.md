# protractor-multiple-cucumber-html-reporter-plugin

[![Build Status](https://travis-ci.org/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin.svg?branch=master)](https://travis-ci.org/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin)
[![npm version](https://img.shields.io/npm/v/protractor-multiple-cucumber-html-reporter-plugin.svg)](https://www.npmjs.com/package/protractor-multiple-cucumber-html-reporter-plugin)
[![NPM License](https://img.shields.io/npm/l/protractor-multiple-cucumber-html-reporter-plugin.svg)](https://github.com/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin/blob/master/LICENSE)

This plugin will connect [Protractor](https://www.npmjs.com/package/protractor), [CucumberJS](https://www.npmjs.com/package/cucumber) and [protractor-cucumber-framework](https://www.npmjs.com/package/protractor-cucumber-framework) to generate unique JSON files per feature with only a few lines of code.
It will also replace the extra CucumberJS hook you needed to make in CucumberJS 1 and 2 to generate unique JSON report files.

> It was born when CucucmberJS 3 [removed](https://github.com/cucumber/cucumber-js/blob/master/CHANGELOG.md#300-2017-08-08) the `registerHandler` and `registerListener`. As of version 3 Protractor and CucumberJS users don't have the possibility to generate and create unique JSON report files. With this module they have.

You will also get [multiple-cucumber-html-reporter](https://github.com/wswebcreation/multiple-cucumber-html-reporter) as a dependency and use it on the fly to generate beautiful reports. A sample can be found [here](https://wswebcreation.github.io/multiple-cucumber-html-reporter/)

## Supported versions
| [Node.js](http://nodejs.org/and) | [Protractor](https://www.npmjs.com/package/protractor) | [CucumberJS](https://www.npmjs.com/package/cucumber)  | [protractor-cucumber-framework](https://www.npmjs.com/package/protractor-cucumber-framework)   | [multiple-cucumber-html-reporter](https://github.com/wswebcreation/multiple-cucumber-html-reporter)   |
| -------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 6.x                              | 4.x                                                    | 1.x                                                   | 3.1.2 or higher                                                                                | 1.0.0 or higher                                                                                       |
| 7.x                              | 5.x                                                    | 2.x                                                   |                                                                                                |                                                                                                       |
|                                  |                                                        | 3.x                                                   |                                                                                                |                                                                                                       |

## Installation
`npm install protractor-multiple-cucumber-html-reporter-plugin --save-dev`

## Usage
You need to do 2 things.

1. Add `format: 'json:.tmp/results.json'` to your `cucumberOpts` in the config. This will tell CucumbjerJS to generate a JSON-file. As of `protractor-cucumber-framework` version 3.1.2 you will get unique JSON files, see also [here](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework#formatters-when-tests-are-sharded-or-with-multi-capabilities).
2. Add the `protractor-multiple-cucumber-html-reporter-plugin` in the `plugins` block inside
`protractor.config.js`.

> **!!The path that is defined in the `format` is the path where all files and reports are saved. Advice is not to save the CucumberJS JSON report fil in the root of the project but in for example a `.tmp/` folder!!**

Here is a short config example of both steps.

```javascript
const path = require('path');

exports.config = {

    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),
    cucumberOpts: {
        require: [
            path.resolve(process.cwd(), './**/*.steps.js')
        ],
        // Tell CucumberJS to save the JSON report
        format: 'json:.tmp/results.json',
        strict: true
    },

    specs: [
        '*.feature'
    ],

    multiCapabilities: [{
        browserName: 'chrome',
        shardTestFiles: true,
        maxInstances: 2,
        chromeOptions: {
            args: ['disable-infobars']
        }
    }],

    // Here the magic happens
    plugins: [{
        package: 'protractor-multiple-cucumber-html-reporter-plugin',
        options:{
            // read the options part
        }
    }]
};

```
## Options
If you don't provide `options` the pluging will use the defaults as mentioned below. Options can be added by creating an object like this:

```js
    plugins: [{
        package: 'protractor-multiple-cucumber-html-reporter-plugin',
        options:{
            // read the options part for more options
            automaticallyGenerateReport: true,
            removeExistingJsonReportFile: true
        }
    }]
```

### `automaticallyGenerateReport`
- **Type:** `boolean`
- **Default:** `false`
- **Mandatory:** No

Setting this option will autimatically generate a new report with `multiple-cucumber-html-reporter`. It will generate a log at the end of the testexection where you can find the report and looks like this. This means that you don't need to call the report module in a seperate node process. For the options of the report see the options `openReportInBrowser`, `reportPath` and `saveCollectedJSON`

```shell
=====================================================================================================
    Multiple Cucumber HTML report generated in:

    /Users/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin/.tmp/report/index.html

    Tnx for using Multiple Cucumber HTML report

    Grtz wswebcreation
=====================================================================================================
```

### `jsonOutputPath`
- **Type:** `string`
- **Default:** `json-output-folder`
- **Mandatory:** No

The directory that will hold all the unique generated JSON files, relative from where the script is started.

**N.B.:** If you use a npm script from the command line, like for example `npm run generate-report` the `jsonOutputPath` will be relative from the path where the script is executed. Executing it from the root of your project will also search for the `jsonOutputPath ` from the root of you project.

If you **DON'T** provide this it will generate a `json-output-folder`-folder in the `path` that it defined the `cucumberOpts.format`.

### `disableLog`
- **Type:** `boolean`
- **Mandatory:** No
- **Default:** `false`

This will disable the log so will **NOT** see this.

```shell
=====================================================================================
    Multiple Cucumber HTML report generated in:

    /Users/wswebcreation/multiple-cucumber-html-reporter/.tmp/index.html
========================================================================
```

### `metadataKey`
- **Type:** `string`
- **Default:** `metadata`
- **Mandatory:** No

This will be the `key` reference in the `capabilities` or `multiCapabilities` that will refer to where the instance specific data is saved. The metadata is used for the report that will be generated, see also [metadata](#metadata).

If for example all the metadata is already present in the `capabilities` but with the `key` called `deviceProperties` you can add the option `metadataKey: 'deviceProperties'` and the plugin will automatically copy the `deviceProperties`-object to the `metadata` of the report.

### `openReportInBrowser`
- **Type:** `boolean`
- **Default:** `false`
- **Mandatory:** No

Settign this option will automatically open the generated report in the default browser of the operating system. See also [here](https://github.com/wswebcreation/multiple-cucumber-html-reporter#openreportinbrowser).

### `removeExistingJsonReportFile`
- **Type:** `boolean`
- **Default:** `false`
- **Mandatory:** No

Settign this option will remove the previous unique JSON report file if it exists. It will prevent double reports of 1 feature + browser execution combination when generating te report with `multiple-cucumber-html-reporter`. This may come in handy when you rerun your flakey features with for example [protractor-flake](https://github.com/NickTomlin/protractor-flake)

### `removeOriginalJsonReportFile`
- **Type:** `boolean`
- **Default:** `false`
- **Mandatory:** No

Setting this option will remove the original json report file, defined in the `cucumberOpts.format`. It will clean up the folder where you save all your results and may be needed if you have a lot of JSON-files with screenshots in it.

### `reportPath`
- **Type:** `string`
- **Default:** `report`
- **Mandatory:** No

The directory in which the report needs to be saved, relative from where the script is started. See also [here](https://github.com/wswebcreation/multiple-cucumber-html-reporter#jsondir).
If you **DON'T** provide this it will generate a `report`-folder in the `path` that it defined the `cucumberOpts.format`.

N.B.: If you use a npm script from the command line, like for example `npm run generate-report` the `reportPath` will be relative from the path where the script is executed. Executing it from the root of your project will also save the report in the `reportPath` in the root of you project.

### `saveCollectedJSON`
- **Type:** `boolean`
- **Default:** `false`
- **Mandatory:** No

`multiple-cucumber-html-reporter` will first merge all the JSON-files to 1 file and then enrich it with data that is used for the report. If `saveCollectedJSON :true` the merged JSON **AND** the enriched JSON will be saved in the [`reportPath`](#reportpath). They will be saved as:

- `merged-output.json`
- `enriched-output.json`

See also [here](https://github.com/wswebcreation/multiple-cucumber-html-reporter#savecollectedjson)

## Metadata
The report can also show on which browser / device a feature has been executed. It is shown on the featurs overview in the table as well as on the feature overview in a container. You can add this by adding the following object to your `capabilities` or `multiCapabilities`

```js
    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: ['disable-infobars']
        },
        // Add this
        metadata: {
            browser: {
                name: 'chrome',
                version: '58'
            },
            device: 'MacBook Pro 15',
            platform: {
                name: 'OSX',
                version: '10.12.6'
            }
        }
    }

    // Or
    multiCapabilities: [{
        browserName: 'chrome',
        chromeOptions: {
            args: ['disable-infobars']
        },
        // Add this
        metadata: {
            browser: {
                name: 'chrome',
                version: '58'
            },
            device: 'MacBook Pro 15',
            platform: {
                name: 'OSX',
                version: '10.12.6'
            }
        }
    }

```

See the metadata information [here](https://github.com/wswebcreation/multiple-cucumber-html-reporter#metadatabrowsername) for the correct values.

> If you don't provide a `browser.name` or a `browser.version` the module will try to determine this automatically. The rest will be shown as questionmarks in the report

## Changelog
The Changelog can be found [here](./CHANGELOG.md)

## Contributing
How to contribute can be found [here](./CONTRIBUTING.md)

## Credits
When creating this plugin I got a lot of inspiration from:

- [protractor-cucumber-framework](https://www.npmjs.com/package/protractor-cucumber-framework)
- [cucumber-js](https://github.com/cucumber/cucumber-js)
- Protractor [plugin-page](https://github.com/angular/protractor/blob/master/docs/plugins.md)

## Thanks
If this plugin was helpful for you, please give it a **★ Star** on
[Github](https://github.com/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin) and
[npm](https://www.npmjs.com/package/protractor-multiple-cucumber-html-reporter-plugin)
