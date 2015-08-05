/*
 * grunt-components-concat
 * https://github.com/alexeiliulin/plugin
 *
 * Copyright (c) 2015 Aleksey Alekseevich Lyulin
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {
    grunt.registerMultiTask('components_concat', 'Concatenates files with the same name', function () {
        grunt.initConfig({});

        grunt.loadNpmTasks("grunt-contrib-concat");

        var _jsOutputFolder = Object.keys(this.data.js)[0];
        var _jsInputFolder = this.data.js[_jsOutputFolder];

        var _cssOutputFolder = Object.keys(this.data.css)[0];
        var _cssInputFolder = this.data.css[_cssOutputFolder];

        var _jsFiles = grunt.file.expand(_jsInputFolder + "/**/*.js");
        var _cssFiles = grunt.file.expand(_cssInputFolder + "/**/*.css");

        var _jsFilesMap = {};
        var _cssFilesMap = {};


        // Fills the JS files map
        _jsFiles.forEach(function(file) {
            // Extracts the filename with extension from the path
            var filename = path.basename(file);

            // Creates a new path list if not yet defined
            if (typeof _jsFilesMap[filename] === "undefined") {
                _jsFilesMap[filename] = [];
            }

            // Adds a path to the list of paths associated with the same file name
            _jsFilesMap[filename].push(file);
        });

        // Fills the CSS files map, like the previous one
        _cssFiles.forEach(function(file) {
            var filename = path.basename(file);

            if (typeof _cssFilesMap[filename] === "undefined") {
                _cssFilesMap[filename] = [];
            }

            _cssFilesMap[filename].push(file);
        });

        var filename;
        var nameWithUnderscore;

        // Adds one Grunt 'concat' target for each JS filename
        for (filename in _jsFilesMap) {
            // Replaces the dot separator between the file name and its extension with underscore
            // in order to avoid Grunt subtarget creation
            nameWithUnderscore = filename.replace('.', '_');

            // Adds a Grunt 'concat' target for each filename so the files cen be concatenated
            grunt.config.set("concat." + nameWithUnderscore + ".src", _jsFilesMap[filename]);
            grunt.config.set("concat." + nameWithUnderscore + ".dest", "build/js/" + filename);
        }

        // Adds one Grunt 'concat' target for each CSS filename, like the previous one
        for(filename in _cssFilesMap) {
            nameWithUnderscore = filename.replace('.', '_');

            grunt.config.set("concat." + nameWithUnderscore + ".src", _cssFilesMap[filename]);
            grunt.config.set("concat." + nameWithUnderscore + ".dest", "build/css/" + filename);
        }

        // Runs Grunt 'concat' task for all the targets created previously

        grunt.task.run("concat");
    });
};
