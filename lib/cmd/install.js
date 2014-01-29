'use strict';

var util = require('../util.js');
var _ = require('underscore');
_.str = require('underscore.string');
var path = require('path');
var fs = require('fs');
var bower = require('bower');
var update = require('../update');
var rimraf = require('rimraf');
var os = require('os');
var chalk = require('chalk');
var minimatch = require('minimatch');

module.exports = function(){

    var installComponent = function(name){

        var bowerjson = util.component(name);
        if (!bowerjson){
            console.log('Unable to find component ' + chalk.bold(name) + ' in ' + chalk.bold(bower.config.directory) + '.  Is it installed?');
            return;
        }

        var config = util.config();

        var files = util.arrayify(bowerjson.main);

        config.extensions.forEach(function(ext){

            var matchingFiles = _.filter(files,function(file){
                return minimatch(file,ext.files,{matchBase:true});
            });

            if (matchingFiles.length > 0) {
                ext.module.install(matchingFiles,bowerjson,ext.options);
            }

        });

        if (util.arrayify(bowerjson.main).length === 0) {
            console.warn(bowerjson.name.bold + ' has no files listed in its ' + chalk.bold('main') + ' property.  Nothing will be installed.');
        }

    };

    /* jshint camelcase: false */
    var tempDir;
    if (process.env.BOWER_PID){
        tempDir = 'bower' + process.env.BOWER_PID;
        tempDir = path.join(os.tmpdir ? os.tmpdir() : os.tmpDir(),'bowinst',tempDir);
    }

    _(process.argv).rest(3).forEach(function(component){

        var doUpdate = false;
        if (process.env.BOWER_PID){
            var bowerjson = path.join(tempDir,component + '.json');
            if (fs.existsSync(bowerjson)){
                doUpdate = true;
            }
        }

        if (doUpdate){
            update(component);
        } else {
            installComponent(component);
        }

    });

    if (process.env.BOWER_PID){
        rimraf.sync(tempDir);
    }

};

module.exports.command = 'install <component>';
module.exports.description = 'install or update one or more components';
