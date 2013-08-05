'use strict';

var util = require('../util.js');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var os = require('os');
var mkdirp = require('mkdirp');

module.exports = function(){

    if (!process.env.bower_pid){
        console.error('preinstall should only be called by bower');
        return;
    }

    var tempDir = 'bower' + process.env.bower_pid;
    tempDir = path.join(os.tmpdir(),'bowinst',tempDir);

    mkdirp.sync(tempDir);

    var cached = [];

    var cacheMetadata = function(name){

        //look for each component to see if its installed
        //copy bower.json to tmp dir/bowinst/bowerPID/...
        var bowerjson = util.component(name);

        if (bowerjson){
            fs.writeFileSync(path.join(tempDir,name + '.json'),JSON.stringify(bowerjson),{encoding:'utf8'});
            cached.push(name);
        }

    }

    _(process.argv).rest(3).forEach(function(component){
        cacheMetadata(component);
    });

    console.log('Cached metadata for ' + cached.join(', '));
};

module.exports.command = 'preinstall <component>';
module.exports.description = 'caches metadata for one or more components before they\'re updated (should only be called by bower)';