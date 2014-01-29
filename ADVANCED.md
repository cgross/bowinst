
### Configuration

Bowinst can be configured by including a `.bowinst.js` file at the root of your project.  Inside the `.bowinst.js` file should be a CommonJS module that exports an object that includes a property named `extensions` which is an array.  The local `.bowinst.js` file will be merged with the [default .bowinst.js](lib/.bowinst.js).  Thus you can use the local `.bowinst.js` file to both override options or add new extensions.

Its common that you'll need to update the location of the main index HTML file.  This can be handled automatically by `bower init` but the same can be accomplished manually.  First, create a file called `.bowinst.js` in your project root and add this code:

```js
module.exports = {
    extensions: [
    ]
};
```

Now you can start adding extensions to the extensions property to override any options you wish to change.  Each extension object has 5 main properties:

- **id** - This is the id of the extension.  You'll need to ensure you have the same id if you're trying to override properties of a default extension.  The id's of the 3 default extensions for Bowinst are `bowinst.js`, `bowinst.css`, and `bowinst.angular`.
- **files** - This is a glob pattern.  An extension will only be executed if the Bower component includes at least one file in its main property that matches this globbing pattern.  For example, the css extension will not run unless the Bower component's main property list at least one file that matches `*.css`.
- **module** - This is the CommonJS module that implements the extension logic.  More details on that in the next section.
- **enabled** - Optional.  If false, the extension will be disabled.
- **options** - This is a list of options that will be passed to the extension callbacks.  Individual extension options can be configured here.

The default extension for both JS and CSS files includes the following properties inside its options attribute:

- **file** - Where to install/uninstall the `<script>` or `<link>` tags.
- **template** - The template for the tag thats going to be inserted.
- **startMarker** - The marker in the file that denotes the start of the section managed by this bowinst extension.
- **endMarker** - The marker in the file that denotes the end of the section managed by this bowinst extension.
- **fileMatcher** - A template used by the extension to look for existing tags in the file.  This simpler template is used rather than `template` because users may add properties to the inserted `<script>`/`<link>` tags (like async for example).  These modified tags then would not match if they were compared against the standard template.

Going back to our scenario, we want to change the location of the main HTML file for both JS and CSS tags.  Lets add those extensions to our `.bowinst.js` and only override the options we want to change.  Like this:

```js
module.exports = {
    extensions: [
    	{
    		id: 'bowinst.js',
    		options: {
    			file: 'other_index.html'
    		}
    	},
    	{
    		id: 'bowinst.css',
    		options: {
    			file: 'other_index.html'
    		}
    	}
    ]
};
```

Now we're respecifying the extensions that are in the [default .bowinst.js](lib/.bowinst.js), but only specifying the file option.  Thus that is the only option being overriden.  We could specify any number of other options (either in the options attribute or a primary attribute) to override other parameters.


### Creating Extensions

Bowinst offers the ability for end-users to provide extensions.  In fact, Bowinst's core features are implemented as extensions so they can be used as guides to writing new ones.  You may also reuse Bowinst's default `generic` extension if you'd simply like to insert lines of text/code inside comment markers.

To create a new extension that reuses the Bowinst generic extension, add the following config to your `.bowinst.js`:

```js
module.exports = {
    extensions: [
    	{
    		id: 'my_custom_extension',
    		files '*.xyz',
    		module: 'generic', //tell Bowinst to reuse its generic extension
    		options: {
                file: 'index.html',
                template: '<!-- this line will be inserted: <%= file %> -->',
                startMarker: '<!-- My Awesome Extension Starts Here -->',
                endMarker: '<!-- My Awesome Extension Stops Here -->',
                fileMatcher: '<%= file %>'
    		}
    	}
    ]
};
```

You can use the generic extension module for any type of files.  Doesn't have to be only HTML files.

If you'd like to create a more complex extension, that doesn't reuse the generic logic, you'll need to create your own node module that conforms to the extension interface.  The skeleton interface for an extension looks like the following:

```js
module.exports = {

    install: function(files,bowerjson,options){

    },

    uninstall: function(files, bowerjson,options){

    },

    update: function(addedFiles,removedFiles,oldBowerjson,newBowerjson,options) {

    }

};
```

Install is called when a Bower component is installed.  `files` is a list of files from the Bower component's main property that matched your globbing patter.  `bowerjson` is the actual `bower.json` config of the Bower component.  `options` is the list of options specified for the extension in `.bowinst.js`.

Uninstall is called when a Bower component is uninstalled.  The list of parameters is identical to `install`.

Update is called when a component is reinstalled on top of an existing version of that component.  `addedFiles` includes any new files from the main property (matching your globbing pattern) that didn't exist in the earlier version of the Bower component.  `removedFiles` is similar but includes files removed as compared to the earlier version.  `oldBowerjson` is the actual `bower.json` from the earlier version of the component.  `newBowerjson` is the `bower.json` from the newer version being installed on top of the older version.  `options` is the list of options specified for the extension in `.bowinst.js`.

Once you've created your module, you'll need to configure your extension in `.bowinst.js` and add your set your module into the configured extension like:

```js
module: require('your_extension.js')
```
You may look at the code for the [generic extension](lib/ext/generic.js) or for the [angular extension](lib/ext/angular.js) as a guide.