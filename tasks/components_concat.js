'use strict';

var path = require('path');


module.exports = function(grunt) {
    grunt.registerMultiTask('components_concat', 'Concatenates files with the same name', function () {

        // Loads Grunt plugins used for cancatenation and minification
        grunt.loadNpmTasks("grunt-contrib-concat");
        grunt.loadNpmTasks("grunt-contrib-uglify");
        grunt.loadNpmTasks("grunt-contrib-cssmin");

        // Needed to suppress the logging of the task headers if no debugging messages are requires
        require('grunt-log-headers')(grunt);

        // Gets configuration properties
        var _srcFolder = this.data.src;
        var _excludePaths = (!Array.isArray(this.data.exclude)) ? [] : this.data.exclude;
        var _destFolders = this.data.dest;
        var _minify = (typeof this.data.minify !== "boolean") ? false : this.data.minify;
        var _debugInfo = (typeof this.data.debugInfo !== "boolean") ? false : this.data.debugInfo;

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
                !Array.isArray(_destFolders)) {
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

        // Holds files to exclude
        var _excludeFiles = [];

        // Gets the list of all the files to exclude for each path specified
        _excludePaths.forEach(function(path) {
            _excludeFiles = _excludeFiles.concat(grunt.file.expand(path));
        });

        // Removes files to exclude form the source files list
        _srcFiles = _srcFiles.filter(function(file) {
            if (_excludeFiles.indexOf(file) >= 0) {
                return false;
            }
            else return true;
        });

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
            // If the path is a file, than insert it in the map
            if (grunt.file.isFile(file)) {
                // Gets the file name with extension from the path string
                var filename = path.basename(file);

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

        // List of tasks and targets to run
        var tasks = {
            concat: [],
            uglify: [],
            cssmin: []
        };

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
                if (!_debugInfo) {
                    grunt.config.set("concat." + filenameUnderscore + ".options", {gruntLogHeader: false});
                }
                // Add concat target to the list
                tasks.concat.push("concat:" + filenameUnderscore);

                // Minify concatenated files if requested
                if (_minify) {

                    if (fileext === "js" || fileext === "css") {
                        var output = destFolder + "/" +  filename.split(".")[0] + ".min." + fileext;
                        var input = destFolder + "/" + filename;
                        var file = {};

                        file[output] = input;

                        if (fileext === "js") {
                            grunt.config.set("uglify." + filenameUnderscore + ".files", file);

                            if (!_debugInfo) {
                                grunt.config.set("uglify." + filenameUnderscore + ".options", {gruntLogHeader: false});
                            }

                            tasks.uglify.push("uglify:" + filenameUnderscore);
                        }
                        else {
                            grunt.config.set("cssmin." + filenameUnderscore + ".files", file);

                            if (!_debugInfo) {
                                grunt.config.set("cssmin." + filenameUnderscore + ".options", {gruntLogHeader: false});
                            }

                            tasks.cssmin.push("cssmin:" + filenameUnderscore);
                        }
                    }
                }
            }
        }

        // Runs the tasks in order defined and removes them from the global Grunt configuration
        for(var task in tasks) {
            tasks[task].forEach(function(taskAndTarget) {
                grunt.task.run(taskAndTarget);
            });
        }
    });
};
