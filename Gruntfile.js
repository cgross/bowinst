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
            reporter: 'spec'
        },        
        all: { 
            src: ['test/test.js']
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('test', ['simplemocha']);

  grunt.registerTask('default', ['jshint', 'test']);

};