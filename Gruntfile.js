'use strict';

var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                'test/*_test.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        clean: {
            ds_store: ["test/expected/**/.DS_Store"],
            tests: ["defaultOptionsOutput", "customOutputFolder", "excludeFoldersOutput", "minifyOptionOutput",
            "noEmptyOptionOutput", "partialOutputFolder", "multipleSourcesOutput", "renameTaskFolder"
        ]
    },
    same_filename_concat: {
        defaultOptionsTarget: {
            src: "test/fixtures",
            dest: "defaultOptionsOutput"
        },
        customOutputFoldersTarget: {
            src: "test/fixtures",
            dest: [
                {"js": "customOutputFolder/js_output"},
                {"css": "customOutputFolder/css_output"},
                {"txt": "customOutputFolder/txt_output"}
            ]
        },
        excludeFoldersTarget: {
            src: "test/fixtures",
            exclude: ["test/fixtures/text/**/*.txt"],
            dest: "excludeFoldersOutput"
        },
        minifyOptionTarget: {
            src: "test/fixtures",
            dest: "minifyOptionOutput",
            minify: true
        },
        skipEmptyFilesOutput: {
            src: "test/fixtures",
            dest: "noEmptyOptionOutput",
            skipEmpty: true
        },
        partialFormatConfiguration: {
            src: "test/fixtures",
            dest: [
                {"js": "partialOutputFolder/js_output"},
                {"txt": "partialOutputFolder/txt_output"}
            ]
        },
        multipleSourceFolders: {
            src: [
                "test/fixtures/code/",
                "test/fixtures/js/"
            ],
            dest: "multipleSourcesOutput"
        },
        renameAndMinifyMultipleSourcesTarget: {
            src: [
                "test/fixtures/code/other",
                "test/fixtures/js/"
            ],
            dest: [
                {"js": "renameTaskFolder/js_output"},
                {"css": "renameTaskFolder/css_output"},
                {"txt": "renameTaskFolder/txt_output"}
            ],
            // Makes custom destinatio folder at runtime
            rename: function(dest, src) {
                return "renameTaskFolder/" + path.basename(src[0]).split(".")[0] + "/" + path.basename(src[0]);
            },
            minify: true
        }
    },
    nodeunit: {
        test: ['test/*_test.js']
    },
    watch: {
        scripts: {
            files:  ['Gruntfile.js', 'tasks/*.js', 'test/*.js'],
            tasks: ['default']
        }
    },
    conventionalChangelog: {
        options: {
            changelogOpts: {
                preset: 'jshint',
                transform: function(commit, cb) {
                    // Link commit hash to commit page on GitHub
                    commit.shortDesc += " [" + commit.hash.slice(0, 7) +
                    "](https://github.com/the-software-factory/grunt-components-concat/commit/" + commit.hash + ")";
                    // Remove the short hash (as we added one in the link)
                    delete commit.hash;

                    cb(null, commit);
                },
                releaseCount: 0
            }
        },
        release: {
            src: 'CHANGELOG.md'
        }
    }
});

// Actually load this plugin's task(s).
grunt.loadTasks('tasks');

// These plugins provide necessary tasks.
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-nodeunit');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-conventional-changelog');

grunt.registerTask("emptyTheChangelog", function() {
    fs.truncateSync(grunt.config.get("conventionalChangelog.release.src"), 0);
});

grunt.registerTask("changelogCommit", function() {
    var done = this.async();

    var gitAdder = exec('git add CHANGELOG.md');

    gitAdder.on("exit", function(exitCode) {
        if (exitCode !== 0) {
            grunt.fail.fatal("changelogCommit task couldn't exec git add command");
        }

        var gitCommitter = exec('git commit -m "CHANGELOG.md Updated"');

        gitCommitter.on("exit", function(exitCode) {
            if (exitCode !== 0) {
                grunt.fail.fatal("changelogCommit task couldn't exec git commit command");
            }

            grunt.log.ok("Changelog commit is ready");
            done();
        });
    });
});

grunt.registerTask("default", "jshint");
grunt.registerTask("development", "watch");
grunt.registerTask("test", ['clean', 'same_filename_concat', 'nodeunit']);
grunt.registerTask("changelog", ["emptyTheChangelog", "conventionalChangelog", "changelogCommit"]);
};
