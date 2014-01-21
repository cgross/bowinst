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

module.exports = function(){

    var installComponent = function(name){

        var installFile = function(componentFile,configExt,bowerjson){

            componentFile = path.join(process.cwd(),bower.config.directory,bowerjson.name,componentFile);

            var updateFile = path.join(process.cwd(),configExt.file);
            if (!fs.existsSync(updateFile)){
                console.log('Attempted to add reference to ' + chalk.bold(updateFile) + ' but that file does not exist.');
                return;
            }

            componentFile = path.relative(path.dirname(updateFile),componentFile);

            var contents = fs.readFileSync(updateFile,'utf8');

            var data = {file:componentFile,bowerjson:bowerjson};

            if (contents.indexOf(_.template(configExt.fileMatcher,data)) !== -1){
                console.log('Reference for ' + chalk.bold(componentFile) + ' in ' + chalk.bold(configExt.file) + ' already exists.');
                return;
            }

            var indexOf = contents.indexOf(configExt.endMarker);
            if (indexOf === -1){
                console.log('Error: '.red + chalk.bold(configExt.endMarker) + ' not found in ' + chalk.bold(configExt.file) + '.');
                return;
            }

            var indent = _.str.strRightBack(contents.substring(0,indexOf),'\n');
            var template = _.template(configExt.template,data);

            contents = _.str.insert(contents,indexOf,template + '\n' + indent);

            fs.writeFileSync(updateFile,contents,'utf8');

            console.log(chalk.bold(template) + ' installed in ' + chalk.bold(configExt.file) + '.');
        };

        var bowerjson = util.component(name);
        if (!bowerjson){
            console.log('Unable to find component ' + chalk.bold(name) + ' in ' + chalk.bold(bower.config.directory) + '.  Is it installed?');
            return;
        }

        var config = util.config();

        _(util.arrayify(bowerjson.main)).each(function(file){
            var ext = file.substring(file.lastIndexOf('.') + 1);
            if (config.fileTypes[ext] ){
                installFile(file,config.fileTypes[ext],bowerjson);
            } else {
                console.log('Attempted to install ' + chalk.bold(file) + ' from ' + chalk.bold(bowerjson.name) + ' but no config found for ' + chalk.bold(ext) + ' files.');
            }
        });

        if (!_(util.arrayify(bowerjson.main)).size()){
            console.warn(bowerjson.name.bold + ' has no files listed in its ' + chalk.bold('main') + ' property.  Nothing will be installed.');
        }

        _(config.extensions).each(function(extension){
            //todo more error checking around the extension being valid
            extension.module.install(bowerjson,extension.options);
        });

    };

    /* jshint camelcase: false */
    var tempDir;
    if (process.env.bower_pid){
        tempDir = 'bower' + process.env.bower_pid;
        tempDir = path.join(os.tmpdir ? os.tmpdir() : os.tmpDir(),'bowinst',tempDir);
    }

    _(process.argv).rest(3).forEach(function(component){

        var doUpdate = false;
        if (process.env.bower_pid){
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

    if (process.env.bower_pid){
        rimraf.sync(tempDir);
    }

};

module.exports.command = 'install <component>';
module.exports.description = 'install or update one or more components';
