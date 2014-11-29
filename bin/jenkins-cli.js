#!/usr/bin/env node

/*
 * jenkins-cli
 * https://github.com/jhidalgo3/jenkins-cli
 *
 * Copyright (c) 2014, Jose Maria Hidalgo Garcia
 * Licensed under the BSD license.
 */

/**
 * Module dependencies.
 */

var program = require('commander'),
    updateNotifier = require('update-notifier'),
    Insight = require('insight'),
    _ = require('underscore'),
    banner = require('../lib/banner.js'),
    Api = require('..'),
    api = new Api('access_token'),
    path = require('path'),
    debug = require('../lib/debugger.js'),
    pkg = require('../package.json');

require('colors');

/*
 * Api Insight
 */

var insight = new Insight({
    trackingCode: 'google-traking-code',
    packageName: pkg.name,
    packageVersion: pkg.version
});

/*
 * Api Bootstrap
 */

program
    .version(pkg.version, '-v, --version')
    .usage('command [option]'.white);

/*
 * Options
 */

program
    .option('-c, --connection [file]', 'Jenkins file connection');


/*
 * Api Signup
 */

program
    .command('config')
    .description('Config Jenkins connection'.white)
    .action(function () {
        var prompts = [{
            type: 'input',
            name: 'url',
            message: 'Jenkins url?'
        }, {
            type: 'input',
            name: 'user',
            message: 'What\'s your user?'
        }, {
            type: 'password',
            name: 'token',
            message: 'What\'s your API Token?'
        },{
            type: 'input',
            name: 'pipelineDirectory',
            message: 'Working dir'
        }];
        //Ask
        api.prompt(prompts, function (jenkins) {
            api.signup(jenkins);
        });
    });

/*
 * Api Status
 */
program
    .command('status')
    .description('Show status of API'.white)
    .action(function (options) {
        options.connection = program.connection;
        api.status(options);
    });


program
    .command('list')
    .description ('List Plugins or Jobs ')
    .option('-p, --plugins', 'Work plugins configuration')
    .option('-j, --jobs', 'Work jobs configuration')
    .action(function (options){
        options.connection = program.connection;
        console.log (program.connection);
        api.list (options);
    });

program
    .command('backup')
    .description("Backup all Plugins or Jobs")
    .option('-p, --plugins', 'Work plugins configuration')
    .option('-j, --jobs', 'Work jobs configuration')
    .action(function (options) {
        options.connection = program.connection;
        api.backup (options);
    });


program
    .command('install')
    .description("Install Plugins or Jobs")
    .option('-p, --plugins', 'Work plugins configuration')
    .option('-j, --jobs', 'Work jobs configuration')
    .action(function (options) {
        options.connection = program.connection;
        api.install (options);
    });

/*
 * Api on help ption show examples
 */

program.on('--help', function () {
    console.log('  Examples:');
    console.log('');
    console.log('    $ jenkins-cli config');
    console.log('    $ jenkins-cli status');
    console.log('');
});

/*
 * Api Banner
 */

if (process.argv.length === 3 && process.argv[2] === '--help') {
    banner();
}

if (process.argv.length === 4 && process.argv[3] !== '--json') {
    banner();
} else {
    if (process.argv.length === 3 && process.argv[2] !== '--help') {
        banner();
    }
}

/*
 * Api Process Parser
 */

program.parse(process.argv);

/*
 * Api Default Action
 */

var notifier = updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
});

if (notifier.update) {
    notifier.notify(true);
}

if (process.argv.length == 2) {
    banner();
    program.help();
}
