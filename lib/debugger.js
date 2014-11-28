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


module.exports = {
    error: function (msg){
        console.log();
        console.log(msg.bold.red);
    },

    info: function (msg){
        console.log();
        console.log(msg.bold.cyan);
    },

    warning: function (msg){
        console.log();
        console.log(msg.bold.yellow);
    },

    success: function (msg){
        console.log();
        console.log(msg.bold.green);
    },

    log: function(msg, type) {
    switch (type) {
        case 'error':
            console.log();
            console.log(msg.bold.red);
            break;
        case 'warning':
            console.log();
            console.log(msg.bold.yellow);
            break;
        case 'info':
            console.log();
            console.log(msg.bold.cyan);
            break;
        case 'success':
            console.log();
            console.log(msg.bold.green);
            break;
        default:
            console.log();
            console.log(msg.bold);
            break;
    }
}

};

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