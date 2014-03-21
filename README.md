# bowinst [![Build Status](https://travis-ci.org/cgross/bowinst.png?branch=master)](https://travis-ci.org/cgross/bowinst)

> Automatically install Bower component references into your HTML or Javascript files.

Bowinst is a command-line application to install Bower component references in your source files.  Bowinst only works with Bower 1.3.0 or later.

### Features

* Add Javascript `<script>` tags or css `<link>` tags from your Bower components into your source files.
* Add Angular module dependencies into your javascript file where you declare `angular.module('name',[...])`.
* Easily configurable via a local `.bowinst.js` file.
* Easily extensible.  Easily add logic for new types of file extensions (ex `sass`, `less`, `coffee`, etc) or use the simple extension system to add more complex logic.
* Non-Destructive.  When installing or reinstalling components, Bowinst will not change existing tags or references.  For example, if you added `async` to a `<script>` tag after bowinst created the tag, further bowinst usage will not remove or alter that `<script>` tag.

### Installation

    npm install -g bowinst

### Getting Started

You'll need to configure `bowinst` before you can get started.  Run `bowinst init` in your project directory to configure it to use `bowinst`.  This configuration must be done in every project you wish to use `bowinst` on.

Here's an example of running `bowinst init`:

```shell
$ bowinst init
Enter the HTML file where <script> and <link> tags should be added (index.html) app/index.html
If this is an Angular project, enter the JS file where the main Angular module is created. If not,
just hit Enter. (app.js) app/scripts/app.js
>> .bowerrc created
>> .bowinst.js created
Good to go!
```

`bowinst init` does the following:
 - Creates/modifies your Bower config in `.bowerrc` so Bower will trigger `bowinst` after each Bower install/uninstall.
 - Creates/modifies a `.bowinst.js` to tell Bowinst where your main HTML file is and, if you're using Angular, where your Angular module setup code exists.  If your answers are the same as the Bowinst's defaults (`index.html` and `app.js`), then `.bowinst.js` won't be created.


Next you'll need to add the comment markers to your HTML file so Bowinst knows where to put your `<script>` and `<link>` tags.  For `<script>` tags, use these surrounding comment markers:

```html
<!-- bower-js:start -->
<!-- bower-js:end -->
```

For `<link>` tags, use these:

```html
<!-- bower-css:start -->
<!-- bower-css:end -->
```

That's it.  Bowinst will now automatically install and uninstall `<script>`, `<link>`, and Angular module references into your project automatically.

### Angular Component Support

When installing a reusable Angular component, if it's `bower.json` includes an `angularModule` property then Bowinst will add that for you.  For example, if you were installing an angular component named `reusableAngularComponent`, it would change this:

```js
angular.module('myApp',['ngRoute']);
```

into:

```js
angular.module('myApp',['ngRoute','reusableAngularComponent']);
```

Please help spread the word to Angular component authors.  Let them know to add the `angularModule` property to their `bower.json` files.

### Advanced Configuration and Creating Extensions

There are many more configuration options as well as the ability for anyone to create their own extensions.  Please see the [Advanced documentation](ADVANCED.md) for more details.


### Release History

* 3/11/2014 v2.1 - Default location for Angular setup is now in `app.js`.
* 1/29/2014 v2.0 - Simplification refactoring.
* 7/23/2013 v1.0 - Initial release.
