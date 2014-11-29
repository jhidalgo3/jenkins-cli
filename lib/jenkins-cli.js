/*
 * jenkins-cli
 * https://github.com/jhidalgo3/jenkins-cli
 *
 * Copyright (c) 2014, Jose Maria Hidalgo Garcia
 * Licensed under the BSD license.
 */

'use strict';

/**
 * Module Dependencies
 */

var inquirer = require('inquirer'),
    _=require ("underscore");
var logger = require('../lib/debugger.js'),
    JenkinsServer = require('./jenkins-server'),
    FileSystem = require('./fileSystem');

var jenkins,
    server,
    fileSystem;


/**
 * Private Methods
 */

/*
 * Public Methods
 */

/**
 * @class jenkins-cli
 *
 * @constructor
 *
 * Constructor responsible for provide api requests
 *
 * @example
 *
 *     var api = new Api('access_token');
 *
 * @param {String} access_token Access Token
 */

var Api = module.exports = function Api(token) {
    this.token = token;
};

/**
 * Method responsible for asking questions
 *
 * @example
 *
 *     api.prompt(prompts, cb);
 *
 * @method prompt
 * @public
 * @param {Object} prompts Array of prompt options
 * @param {Function} cb A callback
 */

Api.prototype.prompt = function prompt(prompts, cb) {
    inquirer.prompt(prompts, function(answers) {
        cb(answers);
    });
};

/**
 * Method responsible for create accounts
 *
 * @example
 *
 *     api.signup('name', 'email', 'password');
 *
 * @method signup
 * @public
 * @param {String} name Name
 * @param {String} email Email
 * @param {String} password Password
 */

Api.prototype.signup = function signup(jenkins) {
	console.log();

    fileSystem = new FileSystem(jenkins.pipelineDirectory);
    server = new JenkinsServer(jenkins.url, fileSystem);

    jenkins.auth = server.auth(jenkins.user, jenkins.token);

    fileSystem.writeFileJson(".jenkins.json", jenkins);
    console.log(jenkins);
};

/**
 * Method responsible for showing the status of api
 *
 * @example
 *
 *     api.status();
 *
 * @method status
 * @public
 * @param {Boolean} pureJson If true show json raw
 */

Api.prototype.status = function status(options) {

    var connection = options.connection;

    if (typeof connection == 'undefined'){
        connection = "/.jenkins.json"
    }

    try {
        jenkins = require(process.cwd() + "/" + connection);
        fileSystem = new FileSystem(jenkins.pipelineDirectory);
        server = new JenkinsServer(jenkins.url, fileSystem,jenkins.auth);

    } catch (e) {
        console.log(e)
        logger.warning("Please, run:\n > jenkins-cli config");
    }
	console.log();
    console.log('Load jenkins connection: ' + JSON.stringify(jenkins, null, 4));

};


Api.prototype.list = function list (options){
        this.status(options);

        if (options.plugins) {
            server.fetchEnabledPlugins().then(function (plugins) {
                _.each(plugins, function (p) {
                    console.out('plugin id: ' + p.shortName + ', version: ' + p.version);
                });
            }).
                then(function () {
                    done(true);
                }, console.error);
        } else if (options.jobs) {
            server.fetchJobs().
                then(function (jobs) {
                    _.each(jobs, function (j) {
                        console.log('job: ' + j.name + ' @ ' + j.url);
                    });
                }).
                then(function () {
                    done(true);
                }, console.error);
        } else {
            console.warn("Nothing to do!");
        }



}

Api.prototype.backup = function backup (options){
    this.status(options);

    if (options.plugins) {
        server.fetchEnabledPlugins().
            then(fileSystem.savePluginsToPipelineDirectory).
            then(function (result) {
                done(result);
            }, console.error);
    } else if (options.jobs) {
        server.fetchJobs().
            then(server.fetchJobConfigurations).
            then(fileSystem.saveJobsToPipelineDirectory).
            then(function (result) {
                done(result);
            }, console.error);
    } else {
        console.warn("Nothing to do!");
    }
}

Api.prototype.install = function install (options){
    this.status(options);

    if (options.plugins) {
        fileSystem.loadPlugins().
            then(server.transformToJenkinsXml).
            then(server.installPlugins).
            then(function () {
                done(true);
            }, console.error);
    } else if (options.jobs) {
        fileSystem.loadJobs().
            then(server.createOrUpdateJobs).
            then(function () {
                done(true);
            }, console.error);
    } else {
        console.warn("Nothing to do!");
    }
}
