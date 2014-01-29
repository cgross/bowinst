'use strict';

var util = require('./util');
var path = require('path');
var fs = require('fs');
var os = require('os');
var _ = require('underscore');
var minimatch = require('minimatch');

/* jshint camelcase: false */
var tempDir = 'bower' + process.env.BOWER_PID;
tempDir = path.join(os.tmpdir ? os.tmpdir() : os.tmpDir(),'bowinst',tempDir);

module.exports = function(name){

	//get bowerjson from cache
	var oldBowerjson = JSON.parse(fs.readFileSync(path.join(tempDir,name + '.json'),'utf8'));
	var newBowerjson = util.component(name);

	var oldMain = util.arrayify(oldBowerjson.main);
	var newMain = util.arrayify(newBowerjson.main);

	var addedFiles = _.difference(newMain,oldMain);
	var removedFiles = _.difference(oldMain,newMain);

	var config = util.config();

    _(config.extensions).each(function(extension){

        var matchingAddedFiles = _.filter(addedFiles,function(file){
            return minimatch(file,extension.files,{matchBase:true});
        });
        var matchingRemovedFiles = _.filter(removedFiles,function(file){
            return minimatch(file,extension.files,{matchBase:true});
        });

        if (matchingAddedFiles.length + matchingRemovedFiles.length > 0){
            extension.module.update(matchingAddedFiles,matchingRemovedFiles,oldBowerjson,newBowerjson,extension.options);
        }
    });

};