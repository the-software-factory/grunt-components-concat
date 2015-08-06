# grunt-components-concat

> Concatenates files with the same name

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-components-concat --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-components-concat');
```

## The "components_concat" task overview
The "components_concat" task concatenates all the files with the same name inside a source folder and puts the concatenated versions  in the destination folder.
The "src" target option is mandatory and it's a path to the source folder
The "dest" target
The concatenation may be optionally followed by the minification (for CSS files) and uglification (for the JS files).

## The "components_concat" target options
#### target.src
* Type: `String`
* Mandatory: `YES`
* Description: It's a path to the source folder which files you want to concatenate

#### target.dest
* Type: `String` or `Array`
* Mandatory: `YES`
** If `dest` is a string, than the output directory for the files with the same extension will be `dest` / `ext` / 
** If `dest` is an array, it maps the file extension to custom output folder; it must be built as follows:
```
      [
        { "txt" : "text_folder" },
        { "js" : "scripts/js" },
        { "css" : "output/styles/css" },
        ...
      ]
```

#### target.minify
Type: `Boolean`
Mandatory: `NO`
Default: `FALSE`
If it's `TRUE` than the minified versions will be also produced for the JS and CSS files.
The CSS files gets minified and the JS ones get uglified.


### Usage Examples
####
In this example only mandatory options are specified.
The concatenated (and eventually minified) files will be put into the custom folders.
The target.minify will take the default `FALSE` value.

```js
grunt.initConfig({
  components_concat: {
    target: {
      src: "test/fixtures",
      dest: [
        {"js": "build/js_output"},
        {"css": "build/css_output"},
        {"txt": "build/txt_output"}
      ]
    },
  },
});
```



## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
