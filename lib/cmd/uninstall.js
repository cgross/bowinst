'use strict';

var util = require('../util.js');
var _ = require('underscore');
_.str = require('underscore.string');
var path = require('path');
var fs = require('fs');
var bower = require('bower');
var colors = require('colors');

module.exports = function(){

    var uninstallComponent = function(name){

        var bowerjson = util.component(name);
        if (!bowerjson){
            console.log('Unable to find component ' + name.bold + ' in ' + bower.config.directory.bold + '.  Is it installed?');
            return;
        }

        var config = util.config();

        _(util.arrayify(bowerjson.main)).each(function(fileRef){
            var ext = fileRef.substring(fileRef.lastIndexOf('.') + 1);
            var configExt = config.fileTypes[ext];
            if (configExt){

                var file = path.join(process.cwd(),configExt.file);
                if (!fs.existsSync(file)){
                    console.log(file.bold + ' not found.');
                    return;
                }

                var contents = fs.readFileSync(file,'utf8');

                var componentFile = path.join(process.cwd(),bower.config.directory,bowerjson.name,fileRef);
                componentFile = path.relative(path.dirname(file),componentFile);

                var matcher = _.template(configExt.fileMatcher,{file:componentFile,name:name,bowerDirectory:bower.config.directory});

                var indexOf = contents.indexOf(matcher);
                if (indexOf !== -1){

                    var start = contents.lastIndexOf('\n',indexOf);
                    var end = contents.indexOf('\n',indexOf);

                    var removed = _.str.trim(contents.substring(start,end));
                    contents = contents.substring(0,start) + contents.substring(end);

                    fs.writeFileSync(file,contents,'utf8');

                    console.log(removed.bold + ' uninstalled from ' + configExt.file.bold + '.');
                }

            }
        });

        _(config.extensions).each(function(extension){
            //todo more error checking around the extension being valid
            extension.module.uninstall(bowerjson,extension.options);
        });
    }

    _(process.argv).rest(3).forEach(function(component){
        uninstallComponent(component);
    });
};

module.exports.command = 'uninstall <component>';
module.exports.description = 'uninstall one or more components';