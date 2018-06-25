/*
 * jenkins-cli
 * https://github.com/jhidalgo3/jenkins-cli
 *
 * Copyright (c) 2014, Jose Maria Hidalgo Garcia
 * Licensed under the BSD license.
 */

var q = require('q'),
    _ = require('underscore'),
    request = require('request'),
    syncRequest = require('sync-request'),
    retry = require('retry'),
    console = require('../lib/debugger.js'),
    fastXmlParser = require('fast-xml-parser');

function JenkinsServer(encoding, serverUrl, fileSystem, auth) {
    this.auth=function (user,pass) {
        var e = new Buffer(user + ":" + pass).toString('base64');
        return e;
    };
    
    // This one tries to get a valid crumb out from Jenkins
    this.getJenkinsCrumb = function() {
    	var crumb = '';
    	var options = {
            url: [serverUrl, 'crumbIssuer', 'api', 'xml'].join('/'),
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + auth
            }
        };
    	
    	var res = syncRequest("GET", [serverUrl, 'crumbIssuer', 'api', 'xml'].join('/'), 
    		{
	    		headers: {
	                'Authorization': 'Basic ' + auth
	            }
    		}
    	);
    	var body = res.getBody('utf-8');
    	var jsonObj = fastXmlParser.parse(body);
    	return jsonObj.defaultCrumbIssuer.crumb;
    };
    
    this.fetchJobs = function (filter) {
        var deferred = q.defer();
        var options = {
            url: [serverUrl, 'api', 'json'].join('/'),
            method: 'POST',
            headers: {
            	'Jenkins-Crumb': this.getJenkinsCrumb(),
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + auth
            }
        };

        request(options, function (e, r, body) {

            if (e) {
                return deferred.reject(e);
            }

            if (r.statusCode !== 200) {
                return deferred.reject(r.statusCode);
            }

            var jobs = JSON.parse(body).jobs;


            deferred.resolve(_.map(jobs, function (j) {
                if (filter.length == 0){
                    return { name: j.name, url: j.url };
                }else if (filter.length > 0 && filter.indexOf (j.name) !== -1){
                    return { name: j.name, url: j.url };
                }
            }));

            console.log(['Found', jobs.length, 'jobs.'].join(' '));
            if (filter.length > 0){
                console.warn ("Apply Filter (" + filter.length + ")");
            }

        });

        return deferred.promise;
    };

    this.fetchEnabledPlugins = function () {
        //var url = ;
        var deferred = q.defer();
        var url = [serverUrl, 'pluginManager', 'api', 'json?depth=1'].join('/');
        var options = {
            url: url,
            method: 'GET',
            headers: {
            	'Jenkins-Crumb': this.getJenkinsCrumb(),
                'Authorization': 'Basic ' + auth
            }
        };
        console.log(url);

        request(options, function (e, r, body) {
            if (e) {
                return deferred.reject(e);
            }

            if (r.statusCode !== 200) {
                return deferred.reject(r.statusCode);
            }

            var result = _.filter(JSON.parse(body).plugins, function (p) {
                return p.enabled;
            });
            var plugins = _.map(result, function (p) {
                return { shortName: p.shortName, version: p.version };
            });

            deferred.resolve(plugins);


        });

        return deferred.promise;
    };


    this.fetchJobConfigurations = function (jobs) {
        //Clean jobs filter
        jobs = _.filter(jobs,function(item){return typeof item != "undefined" });

        var deferred = q.defer();
        var jenkinsCrumb = this.getJenkinsCrumb();
        var jobPromises = _.map(jobs, function (j) {
            var d = q.defer();
            var options = {
                url: [j.url, 'config.xml'].join(''),
                method: 'GET',
                headers: {
                	'Jenkins-Crumb': jenkinsCrumb,
                    'Content-Type': 'application/xml',
                    'Authorization': 'Basic ' + auth
                }
            };
            // Configure the number and frequency
            //	of retries
            var operation = retry.operation({
          	  retries: 8,
          	  factor: 2,
          	  minTimeout: 1 * 500,
          	  maxTimeout: 60 * 1000,
          	  randomize: true,
            });
            operation.attempt(function(currentAttempt) {
	            request(options, function (e, r, body) {
	            	if (operation.retry(e)) {
	            		return;
	            	}
	            	else if (currentAttempt > 1) {
	            		console.warn(j.name + " - retries: " + (currentAttempt - 1))
	            	}
	                j.config = body;
	                d.resolve(j);
	            });
            });
            return d.promise;
        });

        q.allSettled(jobPromises).
            then(function (promises) {

                if ( _.all(promises, function(p) { return (p.state === "fulfilled") ; })){
                    deferred.resolve(_(promises).map(function (p) {
                 //       console.log (p);
                        return p.valueOf();
                    }));
                } else {
                    deferred.reject();
                }

            });

        return deferred.promise;
    };

    //****
    // Create or Update Jobs configuration
    //****
    this.createOrUpdateJobs = function(directories) {
        var deferred = q.defer();

        function resolve (val) {
            deferred.resolve(val);
        }

        directories.forEach(function(folder) {
            fetchJobConfigurationStrategy(folder).
                then(applyStrategy).
                then(resolve);
        });

        return deferred.promise;
    };

    function fetchJobConfigurationStrategy(job) {
        var deferred = q.defer();
        var urlConfig = [serverUrl, 'job', job, 'config.xml'].join('/');

        var options = {
            url: urlConfig,
            method: 'GET',
            headers: {
            	'Jenkins-Crumb': this.getJenkinsCrumb(),
                'Content-Type': 'application/xml',
                'Authorization': 'Basic ' + auth
            }
        };
        
        // Configure the number and frequency
        //	of retries
        var operation = retry.operation({
      	  retries: 8,
      	  factor: 2,
      	  minTimeout: 1 * 500,
      	  maxTimeout: 60 * 1000,
      	  randomize: true,
        });
        
        operation.attempt(function(currentAttempt) {
        	 var req = request(options, function(e, r, b) {
        		if(operation.retry(e)) {
        			return;
        		} else if (currentAttempt > 1) {
        			console.warn(job + " - retries: " + (currentAttempt - 1))
        		}
             	console.log(job)
                 console.log("STATUS " + r.statusCode + " " + job);
                 var strategy = r.statusCode === 200 ? 'update' : 'create';
                 deferred.resolve({strategy: strategy, jobName: job});
             });
        });
       
        return deferred.promise;
    }

    function applyStrategy (strategyObj) {
        console.log (strategyObj.strategy + " " + strategyObj.jobName);

        var deferred = q.defer(),
            filename = [fileSystem.pipelineDirectory, strategyObj.jobName, 'config.xml'].join('/'),
            fileStrategy = {fileName: filename, jobName: strategyObj.jobName};

        console.log (fileStrategy);


        if(strategyObj.strategy === 'create') {
            fileSystem.readFile(fileStrategy).
                then(createJob).
                then(resolve);
        } else if (strategyObj.strategy === 'update') {
            fileSystem.readFile(fileStrategy).
                then(updateJob).
                then(resolve);
        }

        return deferred.promise;
    }


    function createJob (config) {
    	
    	console.log ("Encoding utilizado: " + encoding);
    	var content = config.fileContents;
    	if (encoding) {
	    	var iconv = require('iconv-lite');
	    	content = iconv.encode(config.fileContents, encoding);
	    }
    	// Configure the number and frequency
        //	of retries
        var operation = retry.operation({
      	  retries: 8,
      	  factor: 2,
      	  minTimeout: 1 * 500,
      	  maxTimeout: 60 * 1000,
      	  randomize: true,
        });
    	
        var deferred = q.defer();
        var options = {
            url: [serverUrl, 'createItem'].join('/'),
            method: 'POST',
            qs: {
                name: config.jobName
            },
            headers: {
            	'Jenkins-Crumb': this.getJenkinsCrumb(),
                'Content-Type': 'application/xml',
                'Authorization': 'Basic ' + auth
            },
            body: content
        };
        
        operation.attempt(function(currentAttempt) {
        	 var req = request(options, function(e, r, b) {
                 if(operation.retry(e)) {
                     return;
                 }
                 else if (currentAttempt > 1) {
                	 console.warn(config.jobName + " - retries: " + (currentAttempt - 1))
	             }
                 console.out (" ... Create " + options.qs.name + " " + r.statusCode);
                 deferred.resolve(r.statusCode === 200);
             });
        });
       


        return deferred.promise;
    }

    function updateJob (config) {
    	
    	console.log ("Encoding utilizado: " + encoding);
    	var content = config.fileContents;
    	if (encoding) {
	    	var iconv = require('iconv-lite');
	    	content = iconv.encode(config.fileContents, encoding);
    	}
    	
    	// Configure the number and frequency
        //	of retries
        var operation = retry.operation({
      	  retries: 8,
      	  factor: 2,
      	  minTimeout: 1 * 500,
      	  maxTimeout: 60 * 1000,
      	  randomize: true,
        });
    	
        var deferred = q.defer(),
            options = {
                url: [serverUrl, 'job', config.jobName, 'config.xml'].join('/'),
                method: 'POST',
                headers: {
                	'Jenkins-Crumb': this.getJenkinsCrumb(),
                    'Content-Type': 'application/xml',
                    'Authorization': 'Basic ' + auth
                },
                body: content
            };
        
        operation.attempt(function(currentAttempt) {
        	var req = request(options, function(e, r, b) {
                if(operation.retry(e)) {
                    return;
                }
                else if (currentAttempt > 1) {
                	console.warn(config.jobName + " - retries: " + (currentAttempt - 1))
                }
                console.out("  ... Update " + config.jobName);
                deferred.resolve(r.statusCode === 200);
            });
        });
        

        return deferred.promise;
    }

    //***
    // Create Jobs from Template
    //***
    this.createOrUpdateJobsFromTemplate = function(promises) {
        var deferred = q.defer();

        promises.forEach(function(p) {
            fetchJobConfigurationStrategy(p.value.newJob)
                .then (function (strategyObj){
                strategyObj.fileContents = p.value.config.fileContents;
                    applyStrategyForTemplate(strategyObj);
                });
        });

        return deferred.promise;
    };

    function applyStrategyForTemplate (strategyObj) {
        console.log ("Strategy: " + strategyObj.strategy + " " + strategyObj.jobName);

        var deferred = q.defer();

        if(strategyObj.strategy === 'create') {
            createJob(strategyObj).
                then(resolve);
        } else if (strategyObj.strategy === 'update') {
            updateJob(strategyObj).
                then(resolve);
        }

        return deferred.promise;
    }



    //****
    // Install plugins
    //****
    this.transformToJenkinsXml = function (plugins) {
        var attributes = _.map(plugins, function(p) {
            return ['<install plugin="', p.shortName, '@', p.version, '" />'].join('');
        }).join('\n');
        return {
            xml: ['<jenkins>', attributes, '</jenkins>'].join('\n'),
            plugins: plugins
        };
    }

    this.installPlugins = function(plugins) {
        var deferred = q.defer();
        var options = {
            url: [serverUrl, 'pluginManager', 'installNecessaryPlugins'].join('/'),
            method: 'POST',
            body: plugins.xml,
            headers: {
            	'Jenkins-Crumb': this.getJenkinsCrumb(),
                'Content-Type': 'application/xml',
                'Authorization': 'Basic ' + auth
            }
        };

        request(options, function(e, r, b) {
            if(e) { return deferred.reject(e); }
            _.each(plugins.plugins, function(p) {
                console.log('install: ' + p.shortName + ' @ ' + p.version);
            });
            deferred.resolve(r.statusCode === 200);
        });

        return deferred.promise;
    };

    //****
    // Views
    //****
    this.createPipeline = function(pipeline) {
        var deferred = q.defer();
            pipeline.mode = "au.com.centrumsystems.hudson.plugin.buildpipeline.BuildPipelineView";

            var options = {
                url: [serverUrl, 'createView'].join('/'),
                method: 'POST',

                headers: {
                	'Jenkins-Crumb': this.getJenkinsCrumb(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + auth
                },
                form: {
                    name: pipeline.name,
                    mode: "au.com.centrumsystems.hudson.plugin.buildpipeline.BuildPipelineView",
                    Submit: "OK",
                    json: JSON.stringify(pipeline)
                }

            };

            request(options, function(e, r, b) {
                if(e || r.statusCode !== 302) {
                    return deferred.reject(r.statusCode + (" Pipeline name ("+ pipeline.name +") already in use"));
                }
                console.log ("Pipeline create " + options.form.name + " " + r.statusCode);
                deferred.resolve(pipeline);
            });

        return deferred.promise;
    };

    this.updatePipeline = function (pipeline){

        var job=pipeline.job;
        var name=pipeline.name;

        var deferred = q.defer();

        var pipeline = {
            "name": name,
            "description": "",
            "filterQueue": false,
            "filterExecutors": false,
            "buildViewTitle": "",
            "": "0",
            "gridBuilder": {
                "stapler-class": "au.com.centrumsystems.hudson.plugin.buildpipeline.DownstreamProjectGridBuilder",
                "firstJob": job
            },
            "noOfDisplayedBuilds": "1",
            "triggerOnlyLatestJob": "false",
            "alwaysAllowManualTrigger": "false",
            "showPipelineDefinitionHeader": "false",
            "showPipelineParametersInHeaders": "false",
            "showPipelineParameters": "false",
            "refreshFrequency": "3",
            "cssUrl": "",
            "consoleOutputLinkStyle": "Lightbox",
            "core:apply": "true"
        };

        var options = {
            url: [serverUrl, 'view',name,'configSubmit'].join('/'),
            method: 'POST',

            headers: {
            	'Jenkins-Crumb': this.getJenkinsCrumb(),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + auth
            },
            form: {
                name: name,
                json: JSON.stringify(pipeline)
            }

        };

        request(options, function(e, r, b) {
            console.log (r.statusCode)
            if(e || (r.statusCode !== 302 && r.statusCode !== 404)) {
                return deferred.reject(r.statusCode + (" Pipeline name ("+ name +") already in use"));
            }
            console.log ("Pipeline update " + options.form.name + " " + r.statusCode);
            console.out( "\t Job: " + job);
            deferred.resolve(true);
        });

        return deferred.promise;

    };



}

module.exports = JenkinsServer;
