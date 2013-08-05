'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var esprima = require('esprima');
var colors = require('colors');

var parse = function(file){

    var contents = fs.readFileSync(file,{encoding:'utf8'});
    var ast = esprima.parse(contents,{tokens:true,range:true});

    var pathToFind = [
            {type:'Identifier',value:'angular'},
            {type:'Punctuator',value:'.'},
            {type:'Identifier',value:'module'},
            {type:'Punctuator',value:'('},
            {type:'String'},
            {type:'Punctuator',value:','}
        ];

    var startIndex,endIndex;
    var modules = [];

    var compareTokens = function(a,b){
        return a.type === b.type && (a.value ? a.value === b.value : true);
    };

    _(ast.tokens).each(function(token,i){

        if (!startIndex){
            var matched = true;
            for (var j = 0; j < pathToFind.length; j++) {

                if (ast.tokens.length <= i + j || !compareTokens(pathToFind[j],ast.tokens[i + j])){
                    matched = false;
                    break;
                }
            }
            if (matched){
                startIndex = ast.tokens[i + pathToFind.length -1].range[1];
            }
        }

        if (startIndex && !endIndex && token.type === 'Punctuator' && token.value === ')'){
            endIndex = token.range[0];
        }

        if (startIndex && !endIndex && token.range[0] > startIndex && token.type === 'String'){
            modules.push(token.value.substring(1,token.value.length -1));
        }

    });

    return {start:startIndex,end:endIndex,modules:modules,contents:contents};

};

module.exports = {

    install: function(bowerjson,options){

        if (!bowerjson.angularModule){
            return;
        }

        var file = path.join(process.cwd(),options.file);
        var parsed = parse(file);

        if (parsed.modules.indexOf(bowerjson.angularModule) !== -1){
            console.log('Reference for Angular module ' + bowerjson.angularModule.bold + ' in ' + options.file.bold + ' already exists.');
            return;
        }

        parsed.modules.push(bowerjson.angularModule);
        parsed.modules = _.map(parsed.modules,function(m){ return '\'' + m + '\''});

        var contents = parsed.contents.substring(0,parsed.start) + ' [' + parsed.modules.join(', ') + ']' + parsed.contents.substring(parsed.end);

        fs.writeFileSync(file,contents,{encoding:'utf8'});

        console.log('Angular module reference ' + bowerjson.angularModule.bold + ' installed in ' + file.bold + '.');
    },

    uninstall: function(bowerjson,options){

        if (!bowerjson.angularModule){
            return;
        }

        var file = path.join(process.cwd(),options.file);
        var parsed = parse(file);

        var indexOf = parsed.modules.indexOf(bowerjson.angularModule);
        if (indexOf === -1){
            return;
        }

        parsed.modules.splice(indexOf,1);
        parsed.modules = _.map(parsed.modules,function(m){ return '\'' + m + '\''});

        var contents = parsed.contents.substring(0,parsed.start) + ' [' + parsed.modules.join(', ') + ']' + parsed.contents.substring(parsed.end);

        fs.writeFileSync(file,contents,{encoding:'utf8'});

        console.log('Reference for Angular module ' + bowerjson.angularModule.bold + ' removed from ' + options.file.bold + '.');
    },

    update: function(oldBowerjson,newBowerjson,options){

        var old = (oldBowerjson.angularModule ? oldBowerjson.angularModule : undefined);
        var neww = (newBowerjson.angularModule ? newBowerjson.angularModule : undefined);

        if (old === new){
            return;
        }

        var file = path.join(process.cwd(),options.file);
        var parsed = parse(file);

        var indexOfOld;
        if (old){
            indexOfOld = parsed.modules.indexOf(old);
            if (indexOfOld !== -1){
                parsed.modules.splice(indexOf,1);
                console.log('Reference for Angular module ' + old.bold + ' removed from ' + options.file.bold + '.');            
            }
        }

        if (neww){
            var indexOfNew = parsed.modules.indexOf(neww);
            if (indexOfNew === -1){
                var insertAt = (indexOfOld && indexOfOld !== -1 ? indexOfOld : parsed.modules.length);
                parsed.modules.splice(insertAt,0,neww);
                console.log('Angular module reference ' + neww.bold + ' installed in ' + file.bold + '.');            
            }
        }

        parsed.modules = _.map(parsed.modules,function(m){ return '\'' + m + '\''});

        var contents = parsed.contents.substring(0,parsed.start) + ' [' + parsed.modules.join(', ') + ']' + parsed.contents.substring(parsed.end);

        fs.writeFileSync(file,contents,{encoding:'utf8'});
    }

};