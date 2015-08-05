/*
 * grunt-components-concat
 * https://github.com/alexeiliulin/plugin
 *
 * Copyright (c) 2015 Aleksey Alekseevich Lyulin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['build']
    },
    // Configuration to be run (and then tested).
    components_concat: {
      default_options: {
        options: {
        },
        js: {
          'build/js': 'test/fixtures/js'
        },
        css: {
          'build/css': 'test/fixtures/css'
        }
      }
    },
    // Unit tests.
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


  grunt.registerTask("test", ['clean', 'components_concat', 'nodeunit']);
  grunt.registerTask('default', ['test']);
};
