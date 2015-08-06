'use strict';

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
      tests: ['build']
    },

    components_concat: {
      target: {
        src: "test/fixtures",

        dest: "output",

/*
        dest: [
          {"js": "foo/"},
          {"css": "bar/"},
          {"txt": "asd/"}
        ],
*/
        minify: false
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

  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("test", ['clean', 'jshint', 'components_concat', 'nodeunit']);
  grunt.registerTask('default', ['test']);
};
