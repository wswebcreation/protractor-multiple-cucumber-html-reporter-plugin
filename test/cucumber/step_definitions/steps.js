const defineSupportCode = require('cucumber').defineSupportCode;

defineSupportCode(({ Given, When, Then }) => {
    Given('I do something', () => Promise.resolve('I do something'));

    Given('I foo', () => Promise.resolve('I foo'));

    When('I verified it', () => Promise.resolve('I verified it'));

    When('I foo it', () => Promise.resolve('I foo it'));

    Then('a report will be created', () => Promise.resolve('a report will be created'));

    Then('I foo the bar', () => Promise.resolve('I foo the bar'));
});
