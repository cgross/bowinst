# bowinst [![Build Status](https://travis-ci.org/cgross/bowinst.png?branch=master)](https://travis-ci.org/cgross/bowinst)

> Automatically install Bower component references into your HTML or Javascript files.

Bowinst is a command-line application to install Bower component references in your source files.  Bowinst was written in anticipation of `post_install` hooks being added directly to Bower [bower#249](https://github.com/bower/bower/issues/249).

### Features

* Add Javascript `<script>` tags or css `<link>` tags from your Bower components into your source files.
* Add Angular module dependencies into your javascript file where you declare `angular.module('name',[...])`.
* Easily configurable via a local `.bowinst.js` file.
* Easily extensible.  Easily add logic for new types of file extensions (ex `sass`, `less`, `coffee`, etc) or use the simple extension system to add more complex logic.
* Non-Destructive.  When installing or reinstalling components, Bowinst will not change existing tags or references.  For example, if you added `async` to a `<script>` tag after bowinst created the tag, further bowinst usage will not remove or alter that `<script>` tag.

### Installation

    npm install -g bowinst

### Usage

```bash
bower install <component>    #install the bower component
bowinst install <component>  #now add the script/link tags
```
```bash
bowinst uninstall <component>  #remove the script/link tags
bower uninstall <component>    #now remove the bower component
```

In order to keep `bowinst` simple only those two commands are provided.  Also, both `install` and `uninstall` expect the associated Bower component to be installed in your Bower components directory.  Thus, you should execute `bowinst uninstall <component>` prior to `bower uninstall <component>`.  

Bowinst uses comment markers in your HTML files to know where to put your `<script>` and `<link>` tags.  You must put the following markers in your HTML file:

For css `<link>` elements:
```html
<!-- bower-css:start -->
<!-- bower-css:end -->
```

For Javascript `<script>` elements:
```html
<!-- bower-js:start -->
<!-- bower-js:end -->
```

### Angular Component Support

When installing a reusable Angular component, if the `bower.json` includes an `angularModule` property whose value is the name of its declared Angular module then Bowinst will add that for you.  In other words, it will change:

```js
angular.module('myApp',[]);
```

into:

```js
angular.module('myApp',['reusableAngularComponent']);
```

### Configuration

By default, Bowinst installs javascript and css references into `index.html` and in the case of Angular components looks in `js/setup.js` for your `angular.module(...)` call.  These file locations, as well as a few other options can be overriden by creating a local file named `.bowinst.js`.   Please refer to the [default .bowinst.js](https://github.com/cgross/bowinst/blob/master/lib/.bowinst.js) to see the format of the file.  Your local `.bowinst.js` will be merged with the [default .bowinst.js](https://github.com/cgross/bowinst/blob/master/lib/.bowinst.js) so you only need to specify properties that you wish to override.  

For example, to override just the files that Bowinst installs to, your `.bowinst.js` should look like this:

```js
module.exports = function(){
    return {
        fileTypes: {
            css: {
                file: 'myCustomIndex.html' //install here instead of index.html
           },
            js: {
                file: 'myCustomIndex.html' //install here instead of index.html
            }
        },
        extensions: {
            angular: {
                options: {
                    file: 'scripts/init.js' //install here instead of js/setup.js
                }
            }
        }
    };
};
```

Any property including the comment markers or the tag templates may be overriden.

### Extensions

Bowinst's standard behavior for adding `<script>` tags, `<link>` tags, and Angular module dependencies is configured by the default `.bowinst.js` file.  If you'd like to add processing for new file types, simply add a new file type extension object.  For example, you might add a section to process LESS files like:

```js
module.exports = function(){
    return {
        fileTypes: {
            less: {
                file: 'app.less',
                template: '@import "<%= file %>";',
                startMarker: '/* bower-less:start */',
                endMarker: '/* bower-less:end */',
                fileMatcher: '<%= file %>'
           }
        }
    };
};
```

You may also provide a full-blown plugin/extension by adding a new entry to the `extensions` map.  Extensions are Node/CommonJS modules with `install` and `uninstall` methods.  Both of these methods will be passed two arguments.  First is an object containing the `bower.json` data of the component being installed or uninstalled.  Second is the `options` properties defined in the extension's options.  

A simple extension configuration might look like:

```js
module.exports = function(){
    return {
        fileTypes: {
            ...
        },
        extensions: {
            myExtension: {
                module: require('./myExtension.js'),
                options: {
                    option1: 123,
                    option2: 'abc'
                }
            }
        }
    };
};
```

The Angular support in Bowinst is implemented as an extension.  You can review the [angular.js](https://github.com/cgross/bowinst/blob/master/lib/ext/angular.js) module for that extension as an example.

If you write a broadly applicable extension, submit a pull request!

### Release History

* 7/23/2013 - Initial release.
