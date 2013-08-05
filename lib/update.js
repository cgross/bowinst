'use strict';

var util = require('../util.js');
var bower = require('bower');
var path = require('path');
var fs = require('fs');

var tempDir = 'bower' + process.env.bower_pid;
tempDir = path.join(os.tmpdir(),'bowinst',tempDir);

module.exports = function(name){

	//get bowerjson from cache
	var oldBowerjson = path.join(tempDir,name + '.json');
	var newBowerjson = util.component(name);

	var oldMain = util.arrayify(oldBowerjson.main);
	var newMain = util.arrayify(newBowerjson.main);

	var added = _.difference(newMain,oldMain);
	var removed = _.difference(oldMain,newMain);

	var config = util.config();

	added.forEach(function(file){

		var ext = file.substring(file.lastIndexOf('.') + 1);

        var componentFile = path.join(process.cwd(),bower.config.directory,name,file);

        var updateFile = path.join(process.cwd(),config[ext].file);
        if (!fs.existsSync(updateFile)){
            console.log('Attempted to add reference in ' + updateFile.bold + ' but that file does not exist.');
            return;
        }

        componentFile = path.relative(path.dirname(updateFile),componentFile);

        var parsed = util.parseSection(updateFile,config[ext].startMarker,config[ext].endMarker);

        var insertAfter = parsed.lines.length - 1; //before ending marker

        //search for existing references to insert after
        parsed.lines.forEach(function(line,index){
        	insertAfter = (line.indexOf(bower.config.directory + '/' + name) !== 0 ? index : insertAfter);
        });

        var data = {file:componentFile,bowerjson:newBowerjson};
        var template = _.template(config[ext].template,data);

        parsed.lines.splice(insertAfter,0,parsed.indent + template);

        console.log(template.bold + ' installed in ' + config[ext].file.bold + '.');

        util.saveSection(updateFile,parsed);
	});

	removed.forEach(function(file){

		var ext = file.substring(file.lastIndexOf('.') + 1);

        var componentFile = path.join(process.cwd(),bower.config.directory,name,file);

        var updateFile = path.join(process.cwd(),config[ext].file);
        if (!fs.existsSync(updateFile)){
            console.log('Attempted to remove reference in ' + updateFile.bold + ' but that file does not exist.');
            return;
        }

        componentFile = path.relative(path.dirname(updateFile),componentFile);

        var parsed = util.parseSection();

        parsed.lines = _(parsed.lines).filter(function(line,index){
        	if (line.indexOf(componentFile) !== -1){
        		console.log(line.trim().bold + ' uninstalled from ' + config[ext].file.bold + '.');
        		return false;
        	}
        	return true;
        });

        util.saveSection(updateFile,parsed);

	});

	//call extensions with both before and after json
    _(config.extensions).each(function(extension){
        //todo more error checking around the extension being valid
        extension.module.update(oldBowerjson,newBowerjson,extension.options);
    });	

};