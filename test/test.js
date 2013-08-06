'use strict';

var fs = require('fs');
var execSync = require('execSync');
var expect = require('expect.js');
var spawn = require('child_process').spawn;
var _ = require('underscore');

describe('Bowinst',function(){

    var oldCwd = process.cwd();

    before(function(){

        process.chdir('test/fixture');

        var indexHtml = fs.readFileSync('_index.html','utf8');
        fs.writeFileSync('index.html',indexHtml,'utf8');
        fs.writeFileSync('custom.html',indexHtml,'utf8');

        var setupJs = fs.readFileSync('js/_setup.js','utf8');
        fs.writeFileSync('js/setup.js',setupJs,'utf8');

        if (fs.existsSync('.bowinst.js')) fs.unlinkSync('.bowinst.js');

        var sampleBowerjson = fs.readFileSync('samplev1_bower.json','utf8');
        fs.writeFileSync('bower_components/sample/bower.json',sampleBowerjson,'utf8');  

        var updateHtml = fs.readFileSync('_update.html','utf8');
        fs.writeFileSync('update.html',updateHtml,'utf8');             

    });

    after(function(){

        process.chdir(oldCwd);

    });

    it('should install.',function(){
        
        var result = execSync.exec('../../bin/bowinst install jquery');
        var result = execSync.exec('../../bin/bowinst install angular-unstable');
        var result = execSync.exec('../../bin/bowinst install angular-soft-forms');

        var actual = fs.readFileSync('index.html','utf8');
        var expected = fs.readFileSync('../expected/installed.html','utf8');
        expect(actual).to.eql(expected);

        var actual = fs.readFileSync('js/setup.js','utf8');
        var expected = fs.readFileSync('../expected/installed_setup.js','utf8');

        expect(actual).to.eql(expected);

    });

    it('should uninstall.',function(){

        var result = execSync.exec('../../bin/bowinst uninstall jquery');
        var result = execSync.exec('../../bin/bowinst uninstall angular-unstable');
        var result = execSync.exec('../../bin/bowinst uninstall angular-soft-forms');

        var actual = fs.readFileSync('index.html','utf8');
        var expected = fs.readFileSync('_index.html','utf8');
        expect(actual).to.eql(expected);

        var actual = fs.readFileSync('js/setup.js','utf8');
        var expected = fs.readFileSync('js/_setup.js','utf8');
        expect(actual).to.eql(expected);

    });

    it('should update (preinstall then install) correctly.',function(done){

        var bowinstjs = fs.readFileSync('_.bowinst_update.js','utf8');
        fs.writeFileSync('.bowinst.js',bowinstjs,'utf8');        

        var proc = spawn('../../bin/bowinst', ['preinstall', 'sample'], { env: _.extend({bower_pid:"1234"},process.env) });

        proc.on('close', function (code) {
            
            var bowerjsonv2 = fs.readFileSync('samplev2_bower.json');
            fs.writeFileSync('bower_components/sample/bower.json',bowerjsonv2);

            proc = spawn('../../bin/bowinst', ['install', 'sample'], { env: _.extend({bower_pid:"1234"},process.env) });

            proc.on('close',function(code){

                var actual = fs.readFileSync('update.html','utf8');
                var expected = fs.readFileSync('../expected/updated.html','utf8');
                expect(actual).to.eql(expected);

                var actual = fs.readFileSync('js/setup.js','utf8');
                var expected = fs.readFileSync('../expected/updated_setup.js','utf8');
                expect(actual).to.eql(expected);

                done();
            });
        });

    });

    it('should use a custom config correctly.',function(){

        var bowinstjs = fs.readFileSync('_.bowinst.js','utf8');
        fs.writeFileSync('.bowinst.js',bowinstjs,'utf8');

        var result = execSync.exec('../../bin/bowinst install jquery');

        var actual = fs.readFileSync('custom.html','utf8');
        var expected = fs.readFileSync('../expected/installed_custom.html','utf8');
        expect(actual).to.eql(expected);

    });

});