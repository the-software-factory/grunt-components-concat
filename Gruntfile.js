'use strict';

module.exports = function(grunt) {

    grunt.registerTask("changelog", function() {
        // git log --format=" "
        // %h  => abbreviated commit hash
        // %cD => committer date
        // %cn => committer name
        // %s  => subject
        // %b  => body

        require("child_process").exec('git log --format="##### %h %cD %n ###### %s %n %b" > CHANGELOG.md');
    });

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
      tests: ["defaultOptionsOutput", "customOutputFolder", "excludeFoldersOutput", "minifyOptionOutput"]
    },

    components_concat: {
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
        }
    },

    nodeunit: {
      test: ['test/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask("test", ['clean', 'jshint', 'components_concat', 'nodeunit', 'changelog']);
  grunt.registerTask('default', ['test']);
};
