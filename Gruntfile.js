'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
      //'Gruntfile.js',
      'bin/bowinst',
      'lib/**/*.js',
      '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    nodeunit: {
      tests: ['test/test.js'],
    },

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('test', ['nodeunit']);

  grunt.registerTask('default', ['jshint', 'test']);

};