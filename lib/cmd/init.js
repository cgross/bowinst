'use strict';

var path = require('path');
var fs = require('fs');
var prompt = require('prompt');
var chalk = require('chalk');
var _ = require('underscore');

var writeBowerrc = function(){
    var bowerrc = {};
    var bowerrcPath = path.join(process.cwd(),'.bowerrc');
    var bowerrcMsg = '.bowerrc created';

    if (fs.existsSync(bowerrcPath)){
        bowerrc = JSON.parse(fs.readFileSync(bowerrcPath, 'utf8'));
        bowerrcMsg = '.bowerrc updated';
    }

    bowerrc.scripts = bowerrc.scripts ? bowerrc.scripts : {};

    bowerrc.scripts.preinstall = 'bowinst preinstall %';
    bowerrc.scripts.postinstall = 'bowinst install %';
    bowerrc.scripts.preuninstall = 'bowinst uninstall %';

    bowerrc = JSON.stringify(bowerrc, null, 4);

    fs.writeFileSync(bowerrcPath,bowerrc,'utf8');

    console.log('>> ' + bowerrcMsg);
};

var writeBowinstJs = function(index, appJs){

    var tpl = fs.readFileSync(path.join(__dirname,'..','bowinstjs.tpl'),'utf8');
    tpl = _.template(tpl,{index:index,appjs:appJs});

    fs.writeFileSync('.bowinst.js',tpl,'utf8');

    console.log('>> .bowinst.js created');
};

var doWrites = function(promptData){

    writeBowerrc();

    if (promptData.index !== 'index.html' || promptData.appjs !== 'app.js') {
        writeBowinstJs(promptData.index,promptData.appjs);
    }

    console.log('Good to go!');

};

module.exports = function(){

    prompt.start();

    prompt.message = '';
    prompt.delimiter = '';

    var indexPrompt =  {
        name: 'index',
        description: 'Enter the HTML file where <script> and <link> tags should be added',
        type: 'string',
        default: 'index.html',
        required: true
    };

    var appJsPrompt = {
        name: 'appjs',
        description: 'If this is an Angular project, enter the JS file where the main Angular module is created. If not, just hit Enter.',
        type: 'string',
        default: 'app.js',
        required: true
    };

    prompt.get([indexPrompt,appJsPrompt],function(err,result){

        if (result === undefined) {
            return;
        }

        var bowinstjsPath = path.join(process.cwd(),'.bowinst.js');
        if ((result.index !== 'index.html' || result.appjs !== 'app.js') && fs.existsSync(bowinstjsPath)) {

            var overwritePrompt = {
                name: 'overwrite',
                message: chalk.yellow('.bowinst.js already exists.  Overwrite?'),
                validator: /y[es]*|n[o]?/,
                warning: 'Must respond yes or no',
                default: 'no'
            };

            prompt.get([overwritePrompt],function(err,result2){
                if (result2.overwrite.substring(0,1) === 'y') {
                    doWrites(result);
                } else {
                    console.log(chalk.yellow('init cancelled'));
                }
            });

        } else {
            doWrites(result);
        }

    });

};

module.exports.command = 'init';
module.exports.description = 'initializes bowinst configuration for the current project';