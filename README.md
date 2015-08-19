# grunt-same-filename-concat

Concatenates files with the same name

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

## Installation
You'll need [node](https://nodejs.org/) to install and use grunt-same-filename-concat plugin and its dependencies.
Install the plugin and save it as a development dependency in your project:
```sh
$ npm --save-dev install https://github.com/the-software-factory/grunt-components-concat.git
```

Once the plugin has been installed, it can be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks("grunt-same-filename-concat");
```

Then you should specify some targets for the `same_filename_concat` task

## Task configuration options

#### target.src
* Type: `String | String[]`
* Mandatory: `YES`
* Description: It's a path or an array of paths to the source folders which files you want to concatenate

#### target.exclude
* Type: `Array`
* Mandatory: `NO`
* Default: `[]`
* Description: An array of globbing patterns of files to exclude

#### target.dest
* Type: `String | Object[]`
* Mandatory: `YES`
* Description:
  * If `dest` is a string, than the output directory for the files with the same extension will be `dest` / `ext` /
  * If `dest` is an array, it maps the file extension to custom output folder; it must be built as follows:
```
      [
        { "txt" : "text_folder" },
        { "js" : "scripts/js" },
        { "css" : "output/styles/css" },
        ...
      ]
```

#### target.minify
* Type: `Boolean`
* Mandatory: `NO`
* Default: `FALSE`
* Description:
  If it's `TRUE` than the minified versions of the JS and CSS files will be produced.
  The CSS files gets minified and the JS ones gets uglified.

#### target.debugInfo
* Type: `Boolean`
* Mandatory: `NO`
* Default: `FALSE`
* Description: If it's `FALSE`, the task headers like `Running "uglify:script1_js" (uglify) task` will be suppressed

#### target.skipEmpty
* Type: `Boolean`
* Mandatory: `NO`
* Default: `FALSE`
* Description: If it's `FALSE` the output files with no content will not be created

#### target.rename(dest, src)
* Type: `Function`
* Mandatory: `NO`
* Description:
You can specify the 'rename' function which allows you to change the destination path at runtime.
The 'rename' function has 2 parameters:
    * dest {string} Full destination path for current target, like `'output/folder/script.js'`
    * src {string[]} Array of full source paths for a filename, like
```
[
    'input/folder/script.js',
    'input/folder/subfolder/script.js'
]
```
The return result of this function will overwrite the standard calculated destination path, so you
can make make you build process more flexible

### Usage Examples

#### Custom output folders
In this example only mandatory options are specified.
Other options will assume their default values.
The concatenated files will be put into the custom folders, like this:

```
build
  |----js_output---script1.js
  |             |--script2.js
  |             |--script3.js
  |
  |----css_output---style1.css
  |              |--style2.css
  |
  |----txt_output---TODO.txt
                 |--File.txt
```

Actual task configuration:

```js
grunt.initConfig({
  same_filename_concat: {
    target: {
      src: "test/fixtures",
      dest: [
        {"js": "build/js_output"},
        {"css": "build/css_output"},
        {"txt": "build/txt_output"}
      ]
    }
  }
});
```

#### Standard folders, exclude files, minification and debug headers
The files matched by the globbing pattern in `exclude` will be excluded.
The task headers like `Running "uglify:script1_js" (uglify) task` are shown to provide some debug info.
The concatenated and minified files will be put inside the per-extension folders inside the "output" folder like this:

```
output
  |----js---script1.js
  |      |--script2.js
  |      |--script3.js
  |
  |----css---style1.css
  |       |--style2.css
  |
  |----txt---TODO.txt
          |--File.txt
```


Actual task configuration:

```js
grunt.initConfig({
  same_filename_concat: {
    target: {
      src: "test/fixtures",
      exclude: "test/fixtures/junk/**/*",
      dest: "output",
      minify: true,
      debugInfo: true
    }
  }
});
```

### Grunt Tasks
Here is a list of grunt `tasks` => `actions` mappings, see below for a deeper explanation of the actions.

|   *Grunt task*    | *jshint* |  *watch*  | *clean* | *same_filename_concat* | *nodeunit* | *emptyTheChangelog* | *conventionalChangelog* | *changelogCommit* |
|-------------------|:--------:|:---------:|:-------:|:----------------------:|:----------:|:-------------------:|:-----------------------:|:-----------------:|
|      grunt        |    *     |           |         |                        |            |                     |                         |                   |
| grunt development |          |     *     |         |                        |            |                     |                         |                   |
|   grunt test      |          |           |    *    |            *           |     *      |                     |                         |                   |
| grunt changelog   |          |           |         |                        |            |          *          |            *            |         *         |

* *jshint*: Validate files with JSHint.
* *watch*: Runs default task every time The Gruntfile, sources or tests change
* *clean*: Removes test's output folders to cleanup the test environment
* *same_filename_concat*: Concatenates file with same filenames; the plugin task
* *nodeunit*: Tests if the actual test's output matches the expected one
* *emptyTheChangelog*: Truncates the CHANGELOG.md file as conventionalChangelog task will append fully regenerated changelog
* *conventionalChangelog*: Generates a CHANGELOG.md file from the git log
* *changelogCommit*: Prepares a new git commit with the CHANGELOG.md file

## Tests
Take a look at [`test/README.md`](test/README.md) for more details.

## Contributing
Take a look at [`CONTRIBUTING.md`](CONTRIBUTING.md) for more details.
