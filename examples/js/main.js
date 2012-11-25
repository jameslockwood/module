// This is the application bootstrap.

// We're using jQuery in this app so wait for it to be ready before we continue.
$( function(){

	// Instantiate our App Module, passing in DOM scope
	var application = new App({
		scope: 'section.app-wrapper'
	});

	// Start the application
	application.start();

});
