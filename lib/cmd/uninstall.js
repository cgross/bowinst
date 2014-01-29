'use strict';

var util = require('../util.js');
var _ = require('underscore');
_.str = require('underscore.string');
var bower = require('bower');
var chalk = require('chalk');
var minimatch = require('minimatch');

module.exports = function(){

    var uninstallComponent = function(name){

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
                ext.module.uninstall(matchingFiles,bowerjson,ext.options);
            }

        });

    };

    _(process.argv).rest(3).forEach(function(component){
        uninstallComponent(component);
    });
};

module.exports.command = 'uninstall <component>';
module.exports.description = 'uninstall one or more components';