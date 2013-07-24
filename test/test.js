'use strict';

var fs = require('fs');
var execSync = require('execSync');

process.chdir('test/fixture');

var indexHtml = fs.readFileSync('_index.html',{encoding:'utf8'});
fs.writeFileSync('index.html',indexHtml,{encoding:'utf8'});
fs.writeFileSync('custom.html',indexHtml,{encoding:'utf8'});

var setupJs = fs.readFileSync('js/_setup.js',{encoding:'utf8'});
fs.writeFileSync('js/setup.js',setupJs,{encoding:'utf8'});

fs.unlinkSync('.bowinst.js');

exports.bowinst = {
    setUp: function(done) {
        done();
    },
    install: function(test) {
        test.expect(2);

        var result = execSync.exec('../../bin/bowinst install jquery');
        var result = execSync.exec('../../bin/bowinst install angular-unstable');
        var result = execSync.exec('../../bin/bowinst install angular-soft-forms');

        var actual = fs.readFileSync('index.html','utf8');
        var expected = fs.readFileSync('../expected/installed.html','utf8');
        test.equal(actual, expected, 'should install js and css into index.html correctly.');

        var actual = fs.readFileSync('js/setup.js','utf8');
        var expected = fs.readFileSync('../expected/installed_setup.js','utf8');
        test.equal(actual, expected, 'should install the Angular module into setup.js correctly.');

        test.done();
    },
    uninstall: function(test) {
        test.expect(2);

        var result = execSync.exec('../../bin/bowinst uninstall jquery');
        var result = execSync.exec('../../bin/bowinst uninstall angular-unstable');
        var result = execSync.exec('../../bin/bowinst uninstall angular-soft-forms');

        var actual = fs.readFileSync('index.html','utf8');
        var expected = fs.readFileSync('_index.html','utf8');
        test.equal(actual, expected, 'should uninstall js and css from index.html correctly.');

        var actual = fs.readFileSync('js/setup.js','utf8');
        var expected = fs.readFileSync('js/_setup.js','utf8');
        test.equal(actual, expected, 'should uninstall the Angular module from setup.js correctly.');

        test.done();
    },
    customConfig: function(test) {
        test.expect(1);

        var bowinstjs = fs.readFileSync('_.bowinst.js',{encoding:'utf8'});
        fs.writeFileSync('.bowinst.js',bowinstjs,{encoding:'utf8'});

        var result = execSync.exec('../../bin/bowinst install jquery');

        var actual = fs.readFileSync('custom.html','utf8');
        var expected = fs.readFileSync('../expected/installed_custom.html','utf8');
        test.equal(actual, expected, 'should use custom configuration successfully.');

        test.done();        

    }
};