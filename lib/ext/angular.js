'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var esprima = require('esprima');
var chalk = require('chalk');

var parse = function(file){

    var contents = fs.readFileSync(file,'utf8');
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

    install: function(files,bowerjson,options){

        if (!bowerjson.angularModule){

            if (_(bowerjson.dependencies).find(function(value,key){ return key === 'angular' || key === 'angular-unstable'; })){
                console.log(chalk.bold(bowerjson.name) + ' appears to be an Angular module but does NOT include an ' + chalk.bold('angularModule') + ' property.  You\'ll likely need to add the module dependency manually.');
            }

            return;
        }

        var file = path.join(process.cwd(),options.file);
        var parsed = parse(file);

        if (parsed.modules.indexOf(bowerjson.angularModule) !== -1){
            console.log('Reference for Angular module ' + chalk.bold(bowerjson.angularModule) + ' in ' + chalk.bold(options.file) + ' already exists.');
            return;
        }

        parsed.modules.push(bowerjson.angularModule);
        parsed.modules = _.map(parsed.modules,function(m){ return '\'' + m + '\'';} );

        var contents = parsed.contents.substring(0,parsed.start) + ' [' + parsed.modules.join(', ') + ']' + parsed.contents.substring(parsed.end);

        fs.writeFileSync(file,contents,'utf8');

        console.log('Angular module reference ' + chalk.bold(bowerjson.angularModule) + ' installed in ' + chalk.bold(file) + '.');
    },

    uninstall: function(files,bowerjson,options){

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
        parsed.modules = _.map(parsed.modules,function(m){ return '\'' + m + '\'';} );

        var contents = parsed.contents.substring(0,parsed.start) + ' [' + parsed.modules.join(', ') + ']' + parsed.contents.substring(parsed.end);

        fs.writeFileSync(file,contents,'utf8');

        console.log('Reference for Angular module ' + chalk.bold(bowerjson.angularModule) + ' removed from ' + chalk.bold(options.file) + '.');
    },

    update: function(addedFiles,removedFiles,oldBowerjson,newBowerjson,options){

        var old = (oldBowerjson.angularModule ? oldBowerjson.angularModule : undefined);
        var neww = (newBowerjson.angularModule ? newBowerjson.angularModule : undefined);

        if (old === neww){
            return;
        }

        var file = path.join(process.cwd(),options.file);
        var parsed = parse(file);

        var indexOfOld;
        if (old && !neww){
            indexOfOld = parsed.modules.indexOf(old);
            if (indexOfOld !== -1){
                parsed.modules.splice(indexOfOld,1);
                console.log('Reference for Angular module ' + chalk.bold(old) + ' removed from ' + chalk.bold(options.file) + '.');
            }
        }

        if (neww && !old){
            var indexOfNew = parsed.modules.indexOf(neww);
            if (indexOfNew === -1){
                var insertAt = (indexOfOld && indexOfOld !== -1 ? indexOfOld : parsed.modules.length);
                parsed.modules.splice(insertAt,0,neww);
                console.log('Angular module reference ' + chalk.bold(neww) + ' installed in ' + chalk.bold(file) + '.');
            }
        }

        if (neww && old){
            parsed.modules = _.map(parsed.modules,function(mod){
                if (mod === old){
                    console.log('Angular module reference changed from ' + chalk.bold(old) + ' to ' + chalk.bold(neww) + ' in ' + chalk.bold(options.file) + '.');
                    return neww;
                }
                return mod;
            });
        }

        parsed.modules = _.map(parsed.modules,function(m){ return '\'' + m + '\'';} );

        var contents = parsed.contents.substring(0,parsed.start) + ' [' + parsed.modules.join(', ') + ']' + parsed.contents.substring(parsed.end);

        fs.writeFileSync(file,contents,'utf8');
    }

};