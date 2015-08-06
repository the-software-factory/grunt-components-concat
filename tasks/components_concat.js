'use strict';

var path = require('path');

module.exports = function(grunt) {
    grunt.registerMultiTask('components_concat', 'Concatenates files with the same name', function () {

        // Loads Grunt plugins used for cancatenation and minification
        grunt.loadNpmTasks("grunt-contrib-concat");
        grunt.loadNpmTasks("grunt-contrib-uglify");
        grunt.loadNpmTasks("grunt-contrib-cssmin");
        grunt.loadNpmTasks("grunt-contrib-clean");

        // Gets configuration properties
        var _srcFolder = this.data.src;
        var _destFolders = this.data.dest;
        var _minify = (typeof this.data.minify === "undefined") ? false : this.data.minify;

        // Controls if configuration options are valid

        if (typeof _srcFolder !== "string") {
            grunt.log.error("src option is invalid");
            grunt.fail.fatal("can't run the task due to a fatal error");
        }

        if (!grunt.file.exists(_srcFolder)) {
            grunt.log.error("The source folder doesn't exist");
            grunt.fail.fatal("can't run the task due to a fatal error");
        }

        if (typeof _destFolders !== "string" &&
                typeof _destFolders !== "object") {
            grunt.log.error("dest option is invalid");
            grunt.fail.fatal("can't run the task due to a fatal error");
        }

        // Warns if some files could be overwritten

        // If the dest path is a string
        if (typeof _destFolders === "string") {
            if (grunt.file.exists(_destFolders)) {
                grunt.log.write("\x1b[33;1m[!] The dest folder '" + _destFolders +
                    "' already exists, some files might be overwritten\x1b[39;49m\n");
            }
        }
        // If the dest path is an array
        else {
            _destFolders.forEach(function(destObj) {
                var destFolder = destObj[Object.keys(destObj)[0]];

                if (grunt.file.exists(destFolder)) {
                    grunt.log.write("\x1b[33;1m[!] The dest folder '" + destFolder +
                        "' already exists, some files might be overwritten\x1b[39;49m\n");
                }
            });
        }



        // Gets the list of all the files inside the source folder
        var _srcFiles = grunt.file.expand(_srcFolder + "/**/*");

        /**
         * Files map by file name, as follows:
         * {
         *  "file1.ext": ["path1/file1.ext", "path2/file1.ext],
         *  "file2.zxt": ["path3/file2.zxt, ...],
         *  ...
         * }
         *
         * @type {Object}
         * @private
         */
        var _srcFilesMap = {};

        // Fills the source files map
        _srcFiles.forEach(function(file) {
            // Gets te file name with extension from the path string
            var filename = path.basename(file);

            // If the path is a file, than insert it in the map
            if (grunt.file.isFile(file)) {
                if (typeof _srcFilesMap[filename] === "undefined") {
                    _srcFilesMap[filename] = [];
                }

                _srcFilesMap[filename].push(file);
            }
        });


        /**
         * Files map by file extension, as follows:
         * {
         *  "js": [
         *      ["path1/file1.js", "path2/file1.js"],
         *      ["path1/file2.js", "path4/file2.js"]
         *   ],
         *   "css": [ ... ]
         * }
         *
         * @type {Object}
         * @private
         */
        var _filesByExtension = {};

        // Fills the files map by extension
        for (var filename in _srcFilesMap) {
            // Gets file extension
            var fileExtension = path.extname(filename).replace(".", "");

            if (typeof _filesByExtension[fileExtension] === "undefined") {
                _filesByExtension[fileExtension] = [];
            }

            _filesByExtension[fileExtension].push(_srcFilesMap[filename]);
        }

        // Sets Grunt tasks

        // Loops through arrays of arrays of files with same name by extension
        for (var fileext in _filesByExtension) {

            // Loops though arrays of files with same name
            for (var sameNameFiles in _filesByExtension[fileext]) {

                var filename = path.basename(_filesByExtension[fileext][sameNameFiles][0]);
                var filenameUnderscore = filename.replace(".", "_");
                var fileExtension = filename.split(".")[1];

                // Relative path to the output folder
                var destFolder = null;

                // Add an "ext" folder suffix to the destination folder if _destFolders is a string
                if (typeof _destFolders === "string") {
                    destFolder = _destFolders + "/" + fileExtension;
                }
                // Use the prefix specified in the configuration if _destFolders is an Object
                else {
                    // If the current file extension appears in the configuration object,
                    // use the specified folder
                    _destFolders.forEach(function(destObj) {
                        if (Object.keys(destObj)[0] == fileExtension) {
                            destFolder = destObj[fileExtension];
                        }
                    });

                    // If not, shoot an error and quit
                    if (destFolder === null) {
                        grunt.fail.fatal("No output folder specified for ." + fileExtension + " extension");
                    }
                }

                // Add targets for grunt-contrib-concat plugin to concatenate files with the same name
                grunt.config.set("concat." + filenameUnderscore + ".src", _filesByExtension[fileext][sameNameFiles]);
                grunt.config.set("concat." + filenameUnderscore + ".dest", destFolder + "/" + filename);

                // Minify concatenated files if requested
                if (_minify) {

                    if (fileext === "js" || fileext === "css") {
                        var output = destFolder + "/" +  filename.split(".")[0] + ".min." + fileext;
                        var input = destFolder + "/" + filename;
                        var file = {};

                        file[output] = input;

                        if (fileext === "js") {
                            grunt.config.set("uglify." + filenameUnderscore + ".files", file);
                        }
                        else {
                            grunt.config.set("cssmin." + filenameUnderscore + ".files", file);
                        }

                        // Remove non-minified files
                        grunt.config.set("clean." + filenameUnderscore, destFolder + "/" + filename);
                    }
                }
            }
        }
        
        grunt.task.run("concat");

        if (_minify) {
            grunt.task.run("uglify");
            grunt.task.run("cssmin");
            grunt.task.run("clean");
        }

    });
};
