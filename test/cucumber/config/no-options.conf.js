const path = require('path');
const config = require('./protractor.shared.conf').config;

config.plugins = [{
    path: path.resolve(process.cwd(), './')
}];

exports.config = config;
