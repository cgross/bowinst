
module.exports = {
    extensions: [
        {
            id:'bowinst.js',
            options: {
                file:'custom.html'
            }
        },
        {
            id:'fake',
            files:'*.*',
            module:require('./fakeExt.js'),
            options:{
                file:'custom.html'
            }
        }
    ]
};