// This is the application bootstrap.

var X = App.extend({});

// Instantiate our App Module, passing in DOM scope
var application = new X({
	scope: '.app-wrapper'
});

// Start the application
application.start();