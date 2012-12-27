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

/*
function aop( methodName, context, opts ){
	var method = context[methodName];
	method.before = ( opts && typeof opts.before === 'function' ? opts.before : function(){} );
	method.after = ( opts && typeof opts.after === 'function' ? opts.after : function(){} );
	context[methodName] = function(){
		method.before.apply( context, arguments );
		method.apply( context, arguments );
		method.after.apply( context, arguments );
	};
}

aop( 'go', example, {
	before : function(){
		this.a = 'nah';
	},
	after : function(){
		console.log('ha I just changed a function');
	}
});
*/







