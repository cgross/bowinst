'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('underscore');

module.exports = {

    install: function(bowerjson,options){

        var contents = fs.readFileSync(options.file,'utf8');
        contents += '\n<!-- Added by Fake Extension -->';
        fs.writeFileSync(options.file,contents,'utf8');

    },

    uninstall: function(bowerjson,options){

    }

};