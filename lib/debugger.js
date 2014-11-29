/*
 * jenkins-cli
 * https://github.com/jhidalgo3/jenkins-cli
 *
 * Copyright (c) 2014, Jose Maria Hidalgo Garcia
 * Licensed under the BSD license.
 */

'use strict';

/*
 * Module Dependencies
 */

require('colors');

module.exports.out = function () {
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(this, args);
};

module.exports.log = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[Jenkins-api]'.cyan);
    console.log.apply(this, args);
};

module.exports.out = function () {
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(this, args);
};


module.exports.warn = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(' [warning]'.yellow);
    args.push("\n");
    console.log.apply(this, args);
};

module.exports.info = function () {
    var args = Array.prototype.slice.call(arguments);
    args[0] = "\n" + args[0].toString().cyan;
    args.push("\n");
    console.log.apply(this, args);
};

module.exports.blank = function () {
    var args = Array.prototype.slice.call(arguments);
    args[0] = " ";
    console.log.apply(this, args);
};

module.exports.error = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('\n   [error]'.red);
    args.push("\n");
    console.log.apply(this, args);
};