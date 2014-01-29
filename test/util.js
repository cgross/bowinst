'use strict';

var exec = require('child_process').exec;

var execChain = function(cmds,cb){

	if (cmds.length > 0) {
		exec(cmds[0],function(){
			execChain(cmds.slice(1),cb);
		});
	} else {
		cb();
	}

};

module.exports.execChain = execChain;