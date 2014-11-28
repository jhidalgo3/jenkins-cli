/*
 * jenkins-cli
 * https://github.com/jhidalgo3/jenkins-cli
 *
 * Copyright (c) 2014, Jose Maria Hidalgo Garcia
 * Licensed under the BSD license.
 */

var q = require('q'),
    _ = require('underscore'),
    fs = require('fs'),
    console = require('../lib/debugger.js');

function FileSystem(pipelineDirectory) {

  this.pipelineDirectory = pipelineDirectory;

  this.readFile = function(fileAndJob) {
    var deferred = q.defer();
    fs.readFile(fileAndJob.fileName, function(e, contents) {
      if(e) { return deferred.reject(e); }
      deferred.resolve({fileContents: contents, jobName: fileAndJob.jobName });
    });
    return deferred.promise;
  };

  this.loadJobs = function() {
    var deferred = q.defer();
    fs.readdir(pipelineDirectory, function(e, contents) {
      if(e) { return deferred.reject(e); }

      var directories = _.reject(contents, withDot);

      console.log (directories);

      deferred.resolve(directories);
    });
    return deferred.promise;
  };

  this.loadPlugins = function() {
    var deferred = q.defer();
    var filename = [pipelineDirectory, 'plugins.json'].join('/');
    fs.readFile(filename, function(e, contents) {
      if(e || _.isUndefined(contents)) { return deferred.reject(e); }
      deferred.resolve(JSON.parse(contents));
    });
    return deferred.promise;
  };

  this.savePluginsToPipelineDirectory = function(plugins) {
    var deferred = q.defer();
    ensureDirectoriesExist([pipelineDirectory]);
    var filename = [pipelineDirectory, 'plugins.json'].join('/');
    var body = JSON.stringify(plugins, null, 2);
    fs.writeFile(filename, body, 'utf8', function(e) {
      if(e) { return deferred.reject(e); }

      console.out('created file: ' + filename);
      deferred.resolve(true);
    });

    return deferred.promise;
  };

  this.saveJobsToPipelineDirectory = function(jobs) {

    var deferred = q.defer();
    var fileWritingPromises = _.map(jobs,function(job, index) {
      var j = job.value;

      var d = q.defer();
      ensureDirectoriesExist([pipelineDirectory, j.name]);
      var filename = [pipelineDirectory, j.name, 'config.xml'].join('/');

      fs.writeFile(filename, j.config, 'utf8', function(e) {
        if(e) { return d.reject(e); }

        console.out('created file: ' + filename);
        d.resolve(filename);
      });
      return d.promise;
    });

    q.allSettled(fileWritingPromises).
      then(function(promises) {
        if ( _.all(promises, function(p) { return (p.state === "fulfilled") ; })){
          deferred.resolve(true);
        } else {
          deferred.reject();
        }
      });

    return deferred.promise;
  };

  this.saveGlobalConfiguration = function(body) {
    var deferred = q.defer();
    ensureDirectoriesExist([pipelineDirectory]);
    var filename = [pipelineDirectory, 'config_bck.zip'].join('/');
    fs.writeFile(filename, body, 'utf8', function(e) {
      if(e) { return deferred.reject(e); }

      console.out('created file: ' + filename);
      deferred.resolve(true);
    });

    return deferred.promise;
  };

  this.writeFileJson = function (filename, data){
      fs.writeFile(filename, JSON.stringify(data, null, 4),'utf8', function(err) {
          if(err) {
              console.log(err);
          } else {
              console.log("JSON saved to " + filename);
          }
      });
  }

  function withDot(filename) {
    return (/\./).test(filename);
  }

  function ensureDirectoriesExist(directories) {
    _.each(directories, function(d, index) {
      var path = _.take(directories, (index + 1)).join('/');
      if(!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
    });
  }

}

module.exports = FileSystem;
