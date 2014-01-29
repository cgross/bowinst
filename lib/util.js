'use strict';

/* jshint ignore:start */
var colors = require('colors'); //bower needs colors init-ed
/* jshint ignore:end */
var bower = require('bower');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var _ = require('underscore');
_.str = require('underscore.string');

module.exports = {

    //returns array of component names
    components: function(){

        //should use bower API but 'list' seems broken from the api
        return _(fs.readdirSync(bower.config.directory)).filter(function(file){
            return fs.lstatSync(path.join(bower.config.directory,file)).isDirectory();
        });
    },

    //returns bowerjson for name
    component: function(name){
        if (!fs.existsSync(path.join(bower.config.directory,name))){
            return;
        }

        var configfile = 'bower.json';
        if (!fs.existsSync(path.join(bower.config.directory,name,configfile))){
            configfile = '.bower.json';
            if (!fs.existsSync(path.join(bower.config.directory,name,configfile))){
                return;
            }
        }

        return JSON.parse(fs.readFileSync(path.join(bower.config.directory,name,configfile)));
    },

    //array returns array, anything else returns [arg], undefined returns []
    arrayify: function(arg){
        if (_.isUndefined(arg)) {
            return [];
        }
        return (!_.isArray(arg) ? [arg] : arg);
    },

    //returns config (default bowinst.js combined with custom config if present)
    config: _.memoize(function(){
        var configValue = require('./.bowinst.js');
        if (fs.existsSync(process.cwd() + '/.bowinst.js')){
            var local = require(process.cwd() + '/.bowinst.js');

            if (local.extensions && local.extensions.length > 0) {

                configValue.extensions = configValue.extensions.map(function(ext){
                    var override = _.find(local.extensions,function(lext){
                        return ext.id === lext.id;
                    });
                    if (override) {
                        ext.files = _.isUndefined(override.files) ? ext.files : override.files;
                        ext.module = _.isUndefined(override.module) ? ext.module : override.module;
                        ext.options = _.isUndefined(override.options) ? ext.options : _.defaults(override.options,ext.options);
                    }
                    return ext;
                });

                var newExts = _.filter(local.extensions,function(lext){
                    return _.isUndefined(_.find(configValue.extensions,function(ext){
                        return ext.id === lext.id;
                    }));
                });

                configValue.extensions = configValue.extensions.concat(newExts);

            }
        }

        //filter out disabled extensions
        configValue.extensions = _.filter(configValue.extensions,function(ext){
            if (!_.isUndefined(ext.enabled)) {
                return ext.enabled;
            }
            return true;
        });

        configValue.extensions.forEach(function(ext){
            if (_.isString(ext.module)) {
                if(ext.module === 'generic'){
                    ext.module = require('./ext/generic.js');
                } else {
                    throw 'Invalid config.  Module must either be a CommonJS module or a string of "generic".';
                }
            }
        });

        return configValue;
    }),

    parseSection: function(filename,startMarker,endMarker){

        var contents = fs.readFileSync(filename,'utf8');

        var startMarkerIndex = contents.indexOf(startMarker);

        if (startMarkerIndex === -1){
            throw 'Can\'t find ' + chalk.bold(startMarker) + ' in ' + chalk.bold(filename);
        }

        var startIndex = contents.substring(0,startMarkerIndex).lastIndexOf('\n') + 1;
        var indent = contents.substring(startIndex,startMarkerIndex);

        var endMarkerIndex = contents.indexOf(endMarker);

        if (endMarkerIndex === -1){
            throw 'Can\'t find ' + chalk.bold(endMarker) + ' in ' + chalk.bold(filename);
        }

        var endIndex = contents.indexOf('\n',endMarkerIndex) + 1;

        var lines = contents.substring(startIndex,endIndex - 1).split('\n');

        return {
            contents: contents,
            start:startIndex,
            end:endIndex,
            lines:lines,
            indent:indent
        };
    },

    saveSection: function(file,parsed) {

        var contents = parsed.contents.substring(0,parsed.start);
        contents += parsed.lines.join('\n') + '\n';
        contents += parsed.contents.substring(parsed.end);
        fs.writeFileSync(file,contents,'utf8');

    }

};