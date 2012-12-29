var utils = (typeof utils !== 'undefined' ? utils : {});

// COPY ------------------------------------------------------------------------
var utils = (function() {

	//     Extend lifted from Underscore source code.
	//     Underscore.js 1.2.2
	//     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
	//     Underscore is freely distributable under the MIT license.
	//     Portions of Underscore are inspired or borrowed from Prototype,
	//     Oliver Steele's Functional, and John Resig's Micro-Templating.
	//     For all details and documentation:
	//     http://documentcloud.github.com/underscore
	var breaker = {};
	var ArrayProto = Array.prototype,
		ObjProto = Object.prototype,
		FuncProto = Function.prototype;

	// Create quick reference variables for speed access to core prototypes.
	var slice = ArrayProto.slice,
		hasOwnProperty = ObjProto.hasOwnProperty;

	var nativeForEach = ArrayProto.forEach;

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	var each = function(obj, iterator, context) {
			if(obj === null) {
				return;
			}
			if(nativeForEach && obj.forEach === nativeForEach) {
				obj.forEach(iterator, context);
			} else if(obj.length === +obj.length) {
				for(var i = 0, l = obj.length; i < l; i++) {
					if(i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
				}
			} else {
				for(var key in obj) {
					if(hasOwnProperty.call(obj, key)) {
						if(iterator.call(context, obj[key], key, obj) === breaker) return;
					}
				}
			}
		};

	// Extend a given object with all the properties in passed-in object(s).
	var copy = function(obj) {
			each(slice.call(arguments, 1), function(source) {
				for(var prop in source) {
					if(source[prop] !== void 0) obj[prop] = source[prop];
				}
			});
			return obj;
		};

	utils.copy = copy;

	return utils;

})(utils || {});


// KEYS ------------------------------------------------------------------------
var utils = (function() {

	var ArrayProto = Array.prototype,
		ObjProto = Object.prototype,
		FuncProto = Function.prototype;

	// Create quick reference variables for speed access to core prototypes.
	var hasOwnProperty = ObjProto.hasOwnProperty,
		nativeKeys = Object.keys;

	// Retrieve the names of an object's properties.
	// Delegates to **ECMAScript 5**'s native `Object.keys`
	var keys = nativeKeys ||
	function(obj) {
		if(obj !== Object(obj)) throw new TypeError('Invalid object');
		var keys = [];
		for(var key in obj) if(hasOwnProperty.call(obj, key)) keys[keys.length] = key;
		return keys;
	};

	utils.keys = keys;

	return utils;

})(utils ? utils : {});


// EXTEND ----------------------------------------------------------------------
var utils = (function(utils) {

	//     Lifted from Backbone.js 0.9.2
	//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
	//     Backbone may be freely distributed under the MIT license.
	//     For all details and documentation:
	//     http://backbonejs.org
	// The self-propagating extend function that Backbone classes use.
	var extend = function(protoProps, classProps) {
			var child = inherits(this, protoProps, classProps);
			child.extend = this.extend;
			return child;
		};

	// Shared empty constructor function to aid in prototype-chain creation.
	var ctor = function() {};

	// Helper function to correctly set up the prototype chain, for subclasses.
	// Similar to `goog.inherits`, but uses a hash of prototype properties and
	// class properties to be extended.
	var inherits = function(parent, protoProps, staticProps) {
			var module;

			// The constructor function for the new subclass is either defined by you
			// (the "constructor" property in your `extend` definition), or defaulted
			// by us to simply call the parent's constructor.
			if(protoProps && protoProps.hasOwnProperty('constructor')) {
				module = protoProps.constructor;
			} else {
				module = function() {
					parent.apply(this, arguments);
				};
			}

			// Inherit class (static) properties from parent.
			utils.copy(module, parent);

			// Set the prototype chain to inherit from `parent`, without calling
			// `parent`'s constructor function.
			ctor.prototype = parent.prototype;
			module.prototype = new ctor();

			// Add prototype properties (instance properties) to the subclass,
			// if supplied.
			if(protoProps) utils.copy(module.prototype, protoProps);

			// Add static properties to the constructor function, if supplied.
			if(staticProps) utils.copy(module, staticProps);

			// Correctly set subclass's `prototype.constructor`.
			module.prototype.constructor = module;

			// Set a convenience property in case the parent's prototype is needed later.
			module.__super__ = parent.prototype;

			return module;
		};

	utils.extend = extend;

	return utils;

})(utils || {});


// EVENTS ----------------------------------------------------------------------
var utils = (function(keys) {

	//     Events Aggregator lifted from Backbone js
	//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
	//     Backbone may be freely distributed under the MIT license.
	//     For all details and documentation:
	//     http://backbonejs.org
	var root = this;
	var slice = Array.prototype.slice;
	var splice = Array.prototype.splice;

	// Regular expression used to split event strings
	var eventSplitter = /\s+/;

	var Events = {

		// Bind one or more space separated events, `events`, to a `callback`
		// function. Passing `"all"` will bind the callback to all events fired.
		on: function(events, callback, context) {

			var calls, event, node, tail, list;
			if(!callback) return this;
			events = events.split(eventSplitter);
			calls = this._callbacks || (this._callbacks = {});

			// Create an immutable callback list, allowing traversal during
			// modification.  The tail is an empty object that will always be used
			// as the next node.
			while(event = events.shift()) {
				list = calls[event];
				node = list ? list.tail : {};
				node.next = tail = {};
				node.context = context;
				node.callback = callback;
				calls[event] = {
					tail: tail,
					next: list ? list.next : node
				};
			}

			return this;
		},

		// Remove one or many callbacks. If `context` is null, removes all callbacks
		// with that function. If `callback` is null, removes all callbacks for the
		// event. If `events` is null, removes all bound callbacks for all events.
		off: function(events, callback, context) {
			var event, calls, node, tail, cb, ctx;

			// No events, or removing *all* events.
			if(!(calls = this._callbacks)) return;
			if(!(events || callback || context)) {
				delete this._callbacks;
				return this;
			}

			// Loop through the listed events and contexts, splicing them out of the
			// linked list of callbacks if appropriate.
			events = events ? events.split(eventSplitter) : keys(calls);
			while(event = events.shift()) {
				node = calls[event];
				delete calls[event];
				if(!node || !(callback || context)) continue;
				// Create a new list, omitting the indicated callbacks.
				tail = node.tail;
				while((node = node.next) !== tail) {
					cb = node.callback;
					ctx = node.context;
					if((callback && cb !== callback) || (context && ctx !== context)) {
						this.on(event, cb, ctx);
					}
				}
			}

			return this;
		},

		// Emit one or many events, firing all bound callbacks. Callbacks are
		// passed the same arguments as `emit` is, apart from the event name
		// (unless you're listening on `"all"`, which will cause your callback to
		// receive the true name of the event as the first argument).
		emit: function(events) {
			var event, node, calls, tail, args, all, rest;
			if(!(calls = this._callbacks)) return this;
			all = calls.all;
			events = events.split(eventSplitter);
			rest = slice.call(arguments, 1);

			// For each event, walk through the linked list of callbacks twice,
			// first to emit the event, then to emit any `"all"` callbacks.
			while(event = events.shift()) {
				if(node = calls[event]) {
					tail = node.tail;
					while((node = node.next) !== tail) {
						node.callback.apply(node.context || this, rest);
					}
				}
				if(node = all) {
					tail = node.tail;
					args = [event].concat(rest);
					while((node = node.next) !== tail) {
						node.callback.apply(node.context || this, args);
					}
				}
			}

			return this;
		}

	};

	utils.EventsAggregator = Events;
	return utils;

})(utils, utils.keys);

// Helper Methods --------------------------------------------------------------
var utils = (function(utils) {

	// install an events aggregator to an object
	utils.installEventsTo = function( target ){
		utils.copy( target, utils.EventsAggregator );
	};
	return utils;

})(utils || {});

