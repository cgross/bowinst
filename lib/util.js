'use strict';

var bower = require('bower');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
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

        return JSON.parse(fs.readFileSync(path.join(bower.config.directory,name,configfile),'utf8'));
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
    })

};