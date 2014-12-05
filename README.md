# jenkins-cli [![Build Status](https://secure.travis-ci.org/jhidalgo3/jenkins-cli.png?branch=master)](https://travis-ci.org/jhidalgo3/jenkins-cli) [![NPM version](https://badge-me.herokuapp.com/api/npm/jenkins-cli.png)](http://badges.enytc.com/for/npm/jenkins-cli)


jenkins-cli helps you to migrate configuration jobs and plugins between different Jenkins

Install
-----

Install the module with:

```bash
$ npm install -g jenkins-cli
```

Example:

```javascript
var Api = require('jenkins-cli');
//Create new instance of jenkins-cli
var api = new Api('access_token');
```

Config
-----

Configuration jenkins connection parameters

```bash
$ jenkins-cli -c production.json
```

And complete:

- [?] Jenkins url?
- [?] What's your user?
- [?] What's your API Token?
- [?] Working dir:

Usage
-----

## Jobs (-j)

#### list jobs

```bash
$ jenkins-cli -c production.json list -j
```

#### backup jobs

Save all `config.xml` into working dir

```bash
$ jenkins-cli -c production.json backup -j
```
#### install jobs

Read each `config.xml` from working dir and install or update job

```bash
$ jenkins-cli -c new_production.json backup -j
```

## Plugins (-p)

#### list plugins

```bash
$ jenkins-cli -c production.json list -p
```

#### backup plugins

Save all plugins `plugins.json` in working dir

```bash
$ jenkins-cli -c production.json backup -p
```
#### install plugins

Read each `config.xml` from working dir and install or update job

```bash
$ jenkins-cli -c new_production.json backup -p
```


## Support
If you have any problem or suggestion please open an issue [here](https://github.com/jhidalgo3/jenkins-cli/issues).

## License

The BSD License

Copyright (c) 2014, Jose Maria Hidalgo Garcia

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the Jose Maria Hidalgo Garcia nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
