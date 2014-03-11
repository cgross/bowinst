module.exports = {
    extensions: [
        {
            id:'bowinst.css',                                               //unique id for this extension
            files:'*.css',                                                  //glob pattern for files this ext processes
            module:require('./ext/generic.js'),                             //extension module
            enabled: true,                                                  //flag to turn off the extension
            options: {                                                      //options passed to module as-is during install/uninstall/update
                file: 'index.html',                                         //file to insert/remove references from
                template: '<link href="<%= file %>" rel="stylesheet">',     //template for reference
                startMarker: '<!-- bower-css:start -->',                    //start marker for section containing only bower references
                endMarker: '<!-- bower-css:end -->',                        //end marker
                fileMatcher: '<%= file %>'                                  //matcher used to determine if file ref already exists, is not whole template since template could have been modified after insertion
            }
        },
        {
            id:'bowinst.js',
            files:'*.js',
            module:'generic',
            enabled: true,
            options: {
                file: 'index.html',
                template: '<script src="<%= file %>"></script>',
                startMarker: '<!-- bower-js:start -->',
                endMarker: '<!-- bower-js:end -->',
                fileMatcher: '<%= file %>',
            }
        },
        {
            id:'bowinst.angular',
            files:'*.js',
            module:require('./ext/angular.js'),
            enabled: true,
            options: {
                file: 'app.js'
            }
        }
    ]
};