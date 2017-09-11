// Source: https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/blob/master/test/test_util.js
// Adjusted for own tests

const glob = require('glob');
const child_process = require('child_process');

const CommandlineTest = function (command) {
    const that = this;

    this.command_ = command;
    this.expectedExitCode_ = 0;
    this.expectedOutput_ = [];
    this.expectExitCode = function (exitCode) {
        that.expectedExitCode_ = exitCode;
        return that;
    };

    this.after = function (callback) {
        that.after_ = callback;
        return that;
    };

    this.expectOutput = function (output) {
        that.expectedOutput_.push(output);
        return that;
    };

    this.run = function () {
        let output = '';

        const flushAndFail = (errorMsg) => {
            process.stdout.write(output);
            throw new Error(errorMsg);
        };

        return new Promise((resolve, reject) => {
            const args = that.command_.split(/\s/);
            let test_process;

            test_process = child_process.spawn(args[0], args.slice(1));
            test_process.stdout.on('data', (data) => {
                output += data
            });
            test_process.stderr.on('data', (data) => {
                output += data
            });
            test_process.on('error', (err) => reject(err));
            test_process.on('exit', (exitCode) => resolve(exitCode));
        })
            .then((exitCode) => {
                if (that.expectedExitCode_ !== exitCode) {
                    flushAndFail(
                        `expecting exit code: ${that.expectedExitCode_}, actual: ${exitCode}`
                    );
                }

                that.expectedOutput_.forEach((out) => {
                    if (output.indexOf(out) < 0) {
                        flushAndFail(`expecting output '${out}' in '${output}'`);
                    }
                });

                if (that.after_) {
                    that.after_();
                }
            });
    };
};

/**
 *
 * @param {string} options
 * @returns {CommandlineTest}
 */
function runOne(options) {
    const test = new CommandlineTest(
        `node node_modules/protractor/bin/protractor ${options}`
    );

    return test;
}

/**
 * Find json report files
 *
 * @param {string} pattern
 * @returns {Array} array of found files
 */
function findJsonReportFiles(pattern) {
    return glob.sync(`${pattern}*.json`);
}

module.exports = {
    runOne,
    findJsonReportFiles
};
