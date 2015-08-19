# grunt-same-filename-concat Tests
Defines how to set up an environment to test the project.

## Test Suite Structure
The directory structure within the `test` folder follows theese rules:
```
test
  |----fixtures
  |----expected
  |----*_test.js
```
- The test input files are placed in the `fixtures` folder. If you wish to add some new tests,
please consider creating a new subfolder in `fixtures` so you don't break the existing ones.
- The files which will be compared to the ones produced by plugin execution go in `expected` directory.
Once again, if you want to add a new test, please create a new subfolder in `expected` so you don't
break existing tests.
- \*\_test.js are the test spec files automatically run by nodeunit. If you want to add a new
test spec you can just create a new file which ends with \*\_test.js.

## Installation
You'll need [node](https://nodejs.org/) to install the dependencies and run tests.
Just make sure you've got all the dependencies, including the development ones, installed in the
project's root folder:
```sh
$ npm install
```
And then insall test spec's dependencies:
```sh
$ cd test && npm install
```

## Running tests
Once you install them, just run the `test` Grunt task in the project's root folder, like this:
```sh
$ ./node_modules/grunt-cli/bin/grunt test
```
