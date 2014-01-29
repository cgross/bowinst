'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('underscore');
_.str = require('underscore.string');
var chalk = require('chalk');
var bower = require('bower');
var util = require('../util');

module.exports = {

    install: function(files,bowerjson,options){

        var installFile = function(componentFile){

            componentFile = path.join(process.cwd(),bower.config.directory,bowerjson.name,componentFile);

            var updateFile = path.join(process.cwd(),options.file);
            if (!fs.existsSync(updateFile)){
                console.log('Attempted to add reference to ' + chalk.bold(updateFile) + ' but that file does not exist.');
                return;
            }

            componentFile = path.relative(path.dirname(updateFile),componentFile);

            var contents = fs.readFileSync(updateFile,'utf8');

            var data = {file:componentFile,bowerjson:bowerjson};

            if (contents.indexOf(_.template(options.fileMatcher,data)) !== -1){
                console.log('Reference for ' + chalk.bold(componentFile) + ' in ' + chalk.bold(options.file) + ' already exists.');
                return;
            }

            var indexOf = contents.indexOf(options.endMarker);
            if (indexOf === -1){
                console.log('Error: '.red + chalk.bold(options.endMarker) + ' not found in ' + chalk.bold(options.file) + '.');
                return;
            }

            var indent = _.str.strRightBack(contents.substring(0,indexOf),'\n');
            var template = _.template(options.template,data);

            contents = _.str.insert(contents,indexOf,template + '\n' + indent);

            fs.writeFileSync(updateFile,contents,'utf8');

            console.log(chalk.bold(template) + ' installed in ' + chalk.bold(options.file) + '.');
        };

        files.forEach(installFile);

    },

    uninstall: function(files,bowerjson,options){

        files.forEach(function(fileRef){

            var file = path.join(process.cwd(),options.file);
            if (!fs.existsSync(file)){
                console.log(chalk.bold(file) + ' not found.');
                return;
            }

            var contents = fs.readFileSync(file,'utf8');

            var componentFile = path.join(process.cwd(),bower.config.directory,bowerjson.name,fileRef);
            componentFile = path.relative(path.dirname(file),componentFile);

            var matcher = _.template(options.fileMatcher,{file:componentFile,name:bowerjson.name,bowerDirectory:bower.config.directory});

            var indexOf = contents.indexOf(matcher);
            if (indexOf !== -1){

                var start = contents.lastIndexOf('\n',indexOf);
                var end = contents.indexOf('\n',indexOf);

                var removed = _.str.trim(contents.substring(start,end));
                contents = contents.substring(0,start) + contents.substring(end);

                fs.writeFileSync(file,contents,'utf8');

                console.log(chalk.bold(removed) + ' uninstalled from ' + chalk.bold(options.file) + '.');
            }

        });

    },

    update: function(addedFiles,removedFiles,oldBowerjson,newBowerjson,options){

        addedFiles.forEach(function(file){

            var componentFile = path.join(process.cwd(),bower.config.directory,newBowerjson.name,file);

            var updateFile = path.join(process.cwd(),options.file);
            if (!fs.existsSync(updateFile)){
                console.log('Attempted to add reference in ' + chalk.bold(updateFile) + ' but that file does not exist.');
                return;
            }

            componentFile = path.relative(path.dirname(updateFile),componentFile);

            var parsed = util.parseSection(updateFile,options.startMarker,options.endMarker);

            var insertAfter = parsed.lines.length - 1; //before ending marker

            //search for existing references to insert after
            parsed.lines.forEach(function(line,index){
                insertAfter = (line.indexOf(bower.config.directory + '/' + newBowerjson.name) !== -1 ? index + 1 : insertAfter);
            });

            var data = {file:componentFile,bowerjson:newBowerjson};
            var template = _.template(options.template,data);

            parsed.lines.splice(insertAfter,0,parsed.indent + template);

            console.log(chalk.bold(template) + ' installed in ' + chalk.bold(options.file) + '.');

            util.saveSection(updateFile,parsed);
        });

        removedFiles.forEach(function(file){

            var componentFile = path.join(process.cwd(),bower.config.directory,newBowerjson.name,file);

            var updateFile = path.join(process.cwd(),options.file);
            if (!fs.existsSync(updateFile)){
                console.log('Attempted to remove reference in ' + chalk.bold(updateFile) + ' but that file does not exist.');
                return;
            }

            componentFile = path.relative(path.dirname(updateFile),componentFile);

            var parsed = util.parseSection(updateFile,options.startMarker,options.endMarker);

            parsed.lines = _(parsed.lines).filter(function(line){
                if (line.indexOf(componentFile) !== -1){
                    console.log(chalk.bold(line.trim()) + ' uninstalled from ' + chalk.bold(options.file) + '.');
                    return false;
                }
                return true;
            });

            util.saveSection(updateFile,parsed);

        });

    }

};