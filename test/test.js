'use strict';

var fs = require('fs');
var expect = require('expect.js');
var cp = require('child_process');
var _ = require('underscore');
var util = require('./util.js');

describe('Bowinst',function(){

    var oldCwd = process.cwd();

    before(function(){

        process.chdir('test/fixture');

        var indexHtml = fs.readFileSync('_index.html','utf8');
        fs.writeFileSync('index.html',indexHtml,'utf8');
        fs.writeFileSync('custom.html',indexHtml,'utf8');

        var appJs = fs.readFileSync('_app.js','utf8');
        fs.writeFileSync('app.js',appJs,'utf8');

        if (fs.existsSync('.bowinst.js')) fs.unlinkSync('.bowinst.js');

        var sampleBowerjson = fs.readFileSync('samplev1_bower.json','utf8');
        fs.writeFileSync('bower_components/sample/bower.json',sampleBowerjson,'utf8');

        var updateHtml = fs.readFileSync('_update.html','utf8');
        fs.writeFileSync('update.html',updateHtml,'utf8');

    });

    after(function(){

        process.chdir(oldCwd);

    });

    it('should install.',function(next){

        util.execChain([
                '../../bin/bowinst install jquery',
                '../../bin/bowinst install angular-unstable',
                '../../bin/bowinst install angular-soft-forms'
            ],function(){

                var actual = fs.readFileSync('index.html','utf8');
                var expected = fs.readFileSync('../expected/installed.html','utf8');
                expect(actual).to.eql(expected);

                var actual = fs.readFileSync('app.js','utf8');
                var expected = fs.readFileSync('../expected/installed_app.js','utf8');

                expect(actual).to.eql(expected);

                next();

        });

    });

    it('should uninstall.',function(next){

        util.execChain([
                '../../bin/bowinst uninstall jquery',
                '../../bin/bowinst uninstall angular-unstable',
                '../../bin/bowinst uninstall angular-soft-forms'
            ],function(){

                var actual = fs.readFileSync('index.html','utf8');
                var expected = fs.readFileSync('_index.html','utf8');
                expect(actual).to.eql(expected);

                var actual = fs.readFileSync('app.js','utf8');
                var expected = fs.readFileSync('_app.js','utf8');
                expect(actual).to.eql(expected);

                next();

        });

    });

    it('should update (preinstall then install) correctly.',function(next){

        var bowinstjs = fs.readFileSync('_.bowinst_update.js','utf8');
        fs.writeFileSync('.bowinst.js',bowinstjs,'utf8');

        var proc = cp.spawn('../../bin/bowinst', ['preinstall', 'sample'], { env: _.extend({BOWER_PID:"1234"},process.env) });

        proc.on('close', function (code) {

            var bowerjsonv2 = fs.readFileSync('samplev2_bower.json');
            fs.writeFileSync('bower_components/sample/bower.json',bowerjsonv2);

            proc = cp.spawn('../../bin/bowinst', ['install', 'sample'], { env: _.extend({BOWER_PID:"1234"},process.env) });

            proc.on('close',function(code){

                var actual = fs.readFileSync('update.html','utf8');
                var expected = fs.readFileSync('../expected/updated.html','utf8');
                expect(actual).to.eql(expected);

                var actual = fs.readFileSync('app.js','utf8');
                var expected = fs.readFileSync('../expected/updated_app.js','utf8');
                expect(actual).to.eql(expected);

                next();
            });
        });

    });

    it('should use a custom config correctly.',function(next){

        var bowinstjs = fs.readFileSync('_.bowinst.js','utf8');
        fs.writeFileSync('.bowinst.js',bowinstjs,'utf8');

        cp.exec('../../bin/bowinst install jquery',function(){

            var actual = fs.readFileSync('custom.html','utf8');
            var expected = fs.readFileSync('../expected/installed_custom.html','utf8');
            expect(actual).to.eql(expected);

            next();

        });

    });

});