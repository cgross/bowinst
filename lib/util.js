'use strict';

var bower = require('bower');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
_.str = require('underscore.string');
var colors = require('colors');

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
            configfile = 'component.json';
            if (!fs.existsSync(path.join(bower.config.directory,name,configfile))){
                return;
            }            
        }

        return JSON.parse(fs.readFileSync(path.join(bower.config.directory,name,configfile)));
    },

    //undefined returns undefined, array returns array, anything else returns [arg]
    arrayify: function(arg){
        return (!_.isUndefined(arg) && !_.isArray(arg) ? [arg] : arg);
    },

    //returns config (default bowinst.js combined with custom config if present)
    config: _.memoize(function(){
        var configValue = require('./.bowinst.js')();
        if (fs.existsSync(process.cwd() + '/.bowinst.js')){
            var overrides = require(process.cwd() + '/.bowinst.js')();
            var mergeKeys = ['fileTypes','extensions'];
            _(mergeKeys).each(function(key){
                if (overrides && overrides[key]){
                    _(overrides[key]).each(function(value,subkey){
                        configValue[key][subkey] = configValue[key][subkey] ? _.extend(configValue[key][subkey],value) : value;
                    });
                }                
            });
        }
        return configValue;
    }),

    parseSection: function(filename,startMarker,endMarker){

        var contents = fs.readFileSync(filename,{encoding:'utf8'});

        var startMarkerIndex = contents.indexOf(startMarker);

        if (startMarkerIndex === -1){
            throw 'Can\'t find ' + startMarker.bold + ' in ' + filename.bold;
        }

        var startIndex = contents.substring(0,startMarkerIndex).lastIndexOf('\n');
        var indent = contents.substring(startIndex + 1,startMarkerIndex);

        var endMarkerIndex = contents.indexOf(endMarker);

        if (endMarkerIndex === -1){
            throw 'Can\'t find ' + endMarker.bold + ' in ' + filename.bold;         
        }

        var endIndex = contents.indexOf('\n',endMarker) + 1;

        var lines = contents.substring(startIndex,endIndex).split('\n');

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
        fs.writeFileSync(file,contents,{encoding:'utf8'});
       
    }

};