
var utils = (function( utils ){

	//     Lifted from Backbone.js 0.9.2

	//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
	//     Backbone may be freely distributed under the MIT license.
	//     For all details and documentation:
	//     http://backbonejs.org

	// The self-propagating extend function that Backbone classes use.
	var extend = function (protoProps, classProps) {
		var child = inherits(this, protoProps, classProps);
		child.extend = this.extend;
		return child;
	};

	// Shared empty constructor function to aid in prototype-chain creation.
	var ctor = function(){};

	// Helper function to correctly set up the prototype chain, for subclasses.
	// Similar to `goog.inherits`, but uses a hash of prototype properties and
	// class properties to be extended.
	var inherits = function(parent, protoProps, staticProps) {
		var module;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && protoProps.hasOwnProperty('constructor')) {
			module = protoProps.constructor;
		} else {
			module = function(){ parent.apply(this, arguments); };
		}

		// Inherit class (static) properties from parent.
		utils.copy(module, parent);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		ctor.prototype = parent.prototype;
		module.prototype = new ctor();

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) utils.copy(module.prototype, protoProps);

		// Add static properties to the constructor function, if supplied.
		if (staticProps) utils.copy(module, staticProps);

		// Correctly set subclass's `prototype.constructor`.
		module.prototype.constructor = module;

		// Set a convenience property in case the parent's prototype is needed later.
		module.__super__ = parent.prototype;

		return module;
	};

	utils.extend = extend;

	return utils;

})( utils || {} );