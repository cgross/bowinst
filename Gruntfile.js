'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
      //'Gruntfile.js',
      'bin/bowinst',
      'lib/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    simplemocha: {
        options: {
            reporter: 'spec',
            timeout:4000
        },
        all: {
            src: ['test/test.js']
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('test', ['simplemocha']);

  grunt.registerTask('default', ['jshint', 'test']);

};