/*
  DEFAULTS
*/
module.exports = function(){
    return {
        fileTypes: {
            js: {
                file: 'custom.html'
            }
        },
        extensions: {
            fake: {
                module: require('./fakeExt.js'),
                options: {
                    file: 'custom.html'               
                }
            }
        }
    };
};