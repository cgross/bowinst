/*
  DEFAULTS
*/
module.exports = function(){
    return {
        fileTypes: {
            css: {
                file: 'index.html',                                         //file to insert/remove references from
                template: '<link href="<%= file %>" rel="stylesheet">',     //template for reference
                startMarker: '<!-- bower-css:start -->',                    //start marker for section containing only bower references
                endMarker: '<!-- bower-css:end -->',                        //end marker
                fileMatcher: '<%= file %>'                                  //template that when matched will determine if reference already exists
           },
            js: {
                file: 'index.html',
                template: '<script src="<%= file %>"></script>',
                startMarker: '<!-- bower-js:start -->',
                endMarker: '<!-- bower-js:end -->',
                fileMatcher: '<%= file %>'
            }
        },
        extensions: {
            angular: {
                module: require('./ext/angular.js'),
                options: {
                    file: 'js/setup.js'               
                }
            }
        }
    };
};