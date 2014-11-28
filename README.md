# jenkins-cli [![Build Status](https://secure.travis-ci.org/jhidalgo3/jenkins-cli.png?branch=master)](https://travis-ci.org/jhidalgo3/jenkins-cli) [![NPM version](https://badge-me.herokuapp.com/api/npm/jenkins-cli.png)](http://badges.enytc.com/for/npm/jenkins-cli)

> 

## Getting Started
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

## Documentation

#### .prompt(prompts, cb)

**Parameter**: `prompts`
**Type**: `Array`
**Example**: 

```javascript
var prompts = [
{
	type: 'input',
	name: 'name',
	message: 'What\'s your name?'
}, 
{
	type: 'input',
	name: 'email',
	message: 'What\'s your email?'
}];
```

**Parameter**: `cb`
**Type**: `Function`
**Example**:

```javascript
function(answers) {
	
}
```

The 'prompt' method is responsible for asking questions

How to use this method

```javascript
var prompts = [
{
	type: 'input',
	name: 'name',
	message: 'What\'s your name?'
}, 
{
	type: 'input',
	name: 'email',
	message: 'What\'s your email?'
}];

api.prompt(prompts, function(answers) {
	console.log(answers);
}); 
```

#### .signup(name, email, password)

**Parameter**: `name`
**Type**: `String`
**Example**: `myname`


**Parameter**: `email`
**Type**: `String`
**Example**: `example@example.com`


**Parameter**: `password`
**Type**: `String`
**Example**: `123456test`


The 'signup' method is responsible for create accounts

How to use this method

```javascript

api.signup('myname', 'email', '123456test');
```

#### .status(pureJson)

**Parameter**: `pureJson`
**Type**: `Boolean`
**Example**: `true`


The 'status' method is responsible for showing the status of api

How to use this method

```javascript

api.status(true);
```


## Contributing

See the [CONTRIBUTING Guidelines](https://github.com/jhidalgo3/jenkins-cli/blob/master/CONTRIBUTING.md)

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
