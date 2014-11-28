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

var inquirer = require('inquirer');

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

Api.prototype.signup = function signup(name, email, password) {
	console.log();
    console.log({
        Name: name,
        Email: email,
        Password: password
    });
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

Api.prototype.status = function status(pureJson) {
	console.log();
    console.log('Status: ' + pureJson);
};
