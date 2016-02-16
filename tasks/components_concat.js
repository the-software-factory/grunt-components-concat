'use strict';

module.exports = function(grunt) {

  var path = require('path');
  var fs = require('fs');

  var minifiedFiles = [];

  var removeEmptyMinifiedFiles = function() {
    minifiedFiles.forEach(function(file) {
      var absolutePath = path.resolve("./" + file);

      // If the output file were not created the exception will be fired on fs.statSync()
      try {
        if(fs.statSync(absolutePath).isFile() && fs.statSync(absolutePath).size === 0) {
          grunt.file.delete(file, { force: true });
          grunt.log.ok("Empty minified file " + file + " was removed");
        }
      }
      // Do nothing if the file were not created
      catch(exception) {}
    });
  };

  grunt.registerMultiTask('same_filename_concat', 'Concatenates files with the same name', function () {
    // Loads Grunt plugins used for cancatenation and minification
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    // Needed to suppress the logging of the task headers if no debugging messages are requires

    // TODO This method introduce a bug that need to be fixed within the grunt-log-headers plugin itself.
    //require('grunt-log-headers')(grunt);

    // Gets configuration properties
    var _srcFolder = this.data.src;
    var _excludePaths = (!Array.isArray(this.data.exclude)) ? [] : this.data.exclude;
    var _destFolders = this.data.dest;
    var _minify = (typeof this.data.minify !== "boolean") ? false : this.data.minify;
    var _skipEmpty = (typeof this.data.skipEmpty !== "boolean") ? false : this.data.skipEmpty;
    var _debugInfo = (typeof this.data.debugInfo !== "boolean") ? false : this.data.debugInfo;
    var _renameFunction = this.data.rename;

    // Controls if configuration options are valid

    if (typeof _srcFolder !== "string" && !Array.isArray(_srcFolder)) {
      grunt.log.error("src option is invalid");
      grunt.fail.fatal("can't run the task due to a fatal error");
    }

    // Checks if all specified source folders exist. Stops the task and prints the list of
    // missing source folders on fail
    if (!Array.isArray(_srcFolder)) {
      _srcFolder = [_srcFolder];
    }

    var inexistentSources = [];

    _srcFolder.forEach(function(folder) {
      if (!fs.existsSync(folder)) {
        inexistentSources.push(folder);
      }
    });

    if (inexistentSources.length !== 0) {
      inexistentSources.forEach(function(folder) {
        grunt.log.error("The source folder '" + folder + "' doesn't exist");
      });

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
          "' already exists, some files might be overwritten\x1b[39;49;0m\n");
      }
    }
    // If the dest path is an array
    else {
      _destFolders.forEach(function(destObj) {
        var destFolder = destObj[Object.keys(destObj)[0]];

        if (grunt.file.exists(destFolder)) {
          grunt.log.write("\x1b[33;1m[!] The dest folder '" + destFolder +
            "' already exists, some files might be overwritten\x1b[39;49;0m\n");
        }
      });
    }

    if (typeof _renameFunction !== "function" &&
        typeof _renameFunction !== "undefined") {
      grunt.log.error("rename option must be a function");
      grunt.fail.fatal("can't run the task due to a fatal error");
    }


    // Gets the list of all the files inside the source folder
    var _srcFiles = [];

    if (Array.isArray(_srcFolder)) {
      _srcFolder.forEach(function(folder) {
        _srcFiles = _srcFiles.concat(grunt.file.expand(folder + "/**/*"));
      });
    }
    else {
      _srcFiles = grunt.file.expand(_srcFolder + "/**/*");
    }

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
      else {
        return true;
      }
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
      cssmin: [],
      clean: []
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
            if (Object.keys(destObj)[0] === fileExtension) {
              destFolder = destObj[fileExtension];
            }
          });
        }


        var skip = false;

        // Decides if to create the output file
        if (_skipEmpty) {
          var outputSize = 0;

          _filesByExtension[fileext][sameNameFiles].forEach(function(file) {
            outputSize += fs.statSync(file).size;
          });

          if(outputSize === 0) {
            skip = true;
          }
        }


        if (!skip && destFolder !== null) {

          // Rename option handling
          var renameSrc, renameDest = null;

          if (typeof _renameFunction === "function") {
            renameSrc = _filesByExtension[fileext][sameNameFiles];
            renameDest =  destFolder + "/" + filename;

            renameDest = _renameFunction(renameDest, renameSrc);
          }

          // Add targets for grunt-contrib-concat plugin to concatenate files with the same name
          grunt.config.set("concat." + filenameUnderscore + ".src", _filesByExtension[fileext][sameNameFiles]);
          grunt.config.set("concat." + filenameUnderscore + ".dest",
            (renameDest !== null) ? renameDest : destFolder + "/" + filename);

          if (!_debugInfo) {
            grunt.config.set("concat." + filenameUnderscore + ".options", {gruntLogHeader: false});
          }

          // Add concat target to the list
          tasks.concat.push("concat:" + filenameUnderscore);

          // Minify concatenated files if requested
          if (_minify) {

            if (fileext === "js" || fileext === "css") {
              var output, input, file;

              // Sets up minification input/output paths
              if (renameDest !== null) {
                output = path.dirname(renameDest) + "/" + path.basename(renameDest).split(".")[0] + ".min." + path.basename(renameDest).split(".")[1];
                input = renameDest;
              }
              else {
                output = destFolder + "/" +  filename.split(".")[0] + ".min." + fileext;
                input = destFolder + "/" + filename;
              }

              file = {};

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

              minifiedFiles.push(output);

              // Sets up clean task to remove non-minified files
              if(!Array.isArray(grunt.config.get("clean.sameNameConcatMinificationCleanup"))) {
                grunt.config.set("clean.sameNameConcatMinificationCleanup", []);
              }

              var filesToRemove = grunt.config.get("clean.sameNameConcatMinificationCleanup");
              filesToRemove.push(input);
              grunt.config.set("clean.sameNameConcatMinificationCleanup", filesToRemove);
            }
          }
        }
      }
    }

    if (_minify) {
      tasks.clean.push("clean:sameNameConcatMinificationCleanup");
    }

    // Runs the tasks in order defined and removes them from the global Grunt configuration
    for(var task in tasks) {
      tasks[task].forEach(function(taskAndTarget) {
        grunt.task.run(taskAndTarget);
      });
    }

    // Removes empty minified files is skipEmpty = true
    if (_skipEmpty) {
      removeEmptyMinifiedFiles();
    }

    // Removes the targets inserted by the plugin
    grunt.registerTask("components_concat_config_cleanup", function() {
      for(var task in tasks) {
        tasks[task].forEach(function(taskAndTarget) {
          var task = taskAndTarget.split(":")[0];
          var target = taskAndTarget.split(":")[1];

          delete grunt.config.data[task][target];
        });
      }
    });

    grunt.task.run("components_concat_config_cleanup");
  });
};
