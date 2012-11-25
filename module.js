(function() {

	// 	Establish the root object, `window` in the browser, or `global` on the server.
	var root = this,
		utils = {};

	// 	utils.copy -------------------------------------------------------------------------
	//	Extends a given object with all the properties of passed-in object(s)
	utils = (function(){

	  //     Extend lifted from Underscore source code.
	  
	  //     Underscore.js 1.2.2
	  //     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
	  //     Underscore is freely distributable under the MIT license.
	  //     Portions of Underscore are inspired or borrowed from Prototype,
	  //     Oliver Steele's Functional, and John Resig's Micro-Templating.
	  //     For all details and documentation:
	  //     http://documentcloud.github.com/underscore  

	  var breaker = {};
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var slice            = ArrayProto.slice,
	      hasOwnProperty   = ObjProto.hasOwnProperty;

	  var nativeForEach = ArrayProto.forEach;

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles objects with the built-in `forEach`, arrays, and raw objects.
	  // Delegates to **ECMAScript 5**'s native `forEach` if available.
	  var each = function(obj, iterator, context) {
	    if (obj == null) return;
	    if (nativeForEach && obj.forEach === nativeForEach) {
	      obj.forEach(iterator, context);
	    } else if (obj.length === +obj.length) {
	      for (var i = 0, l = obj.length; i < l; i++) {
	        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
	      }
	    } else {
	      for (var key in obj) {
	        if (hasOwnProperty.call(obj, key)) {
	          if (iterator.call(context, obj[key], key, obj) === breaker) return;
	        }
	      }
	    }
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  var copy = function(obj) {
	    each(slice.call(arguments, 1), function(source) {
	      for (var prop in source) {
	        if (source[prop] !== void 0) obj[prop] = source[prop];
	      }
	    });
	    return obj;
	  };

	  utils.copy = copy;

	  return utils;

	})( utils || {} );

	// 	utils.key -------------------------------------------------------------------------
	//	Retrieves the names of an object's properties
	var utils = (function(){

	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var hasOwnProperty   = ObjProto.hasOwnProperty,
	      nativeKeys = Object.keys;

	  // Retrieve the names of an object's properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  var keys = nativeKeys || function(obj) {
	    if (obj !== Object(obj)) throw new TypeError('Invalid object');
	    var keys = [];
	    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
	    return keys;
	  };

	  utils.keys = keys;

	  return utils;

	})( utils ? utils : {} );

	// 	eventsAggregator  -------------------------------------------------------------------------
	//	Contains on/off/trigger functions for binding / unbinding and firing.
	var eventsAggregator = (function( utils ){

	  //     Events Aggregator lifted from Backbone js
	  //     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
	  //     Backbone may be freely distributed under the MIT license.
	  //     For all details and documentation:
	  //     http://backbonejs.org

	  // Initial Setup
	  // -------------

	  // Save a reference to the global object (`window` in the browser, `global`
	  // on the server).
	  var root = this;

	  // Create a local reference to slice/splice.
	  var slice = Array.prototype.slice;
	  var splice = Array.prototype.splice;

	  // Backbone.Events
	  // -----------------

	  // Regular expression used to split event strings
	  var eventSplitter = /\s+/;

	  var Events = {

	    // Bind one or more space separated events, `events`, to a `callback`
	    // function. Passing `"all"` will bind the callback to all events fired.
	    on: function(events, callback, context) {

	      var calls, event, node, tail, list;
	      if (!callback) return this;
	      events = events.split(eventSplitter);
	      calls = this._callbacks || (this._callbacks = {});

	      // Create an immutable callback list, allowing traversal during
	      // modification.  The tail is an empty object that will always be used
	      // as the next node.
	      while (event = events.shift()) {
	        list = calls[event];
	        node = list ? list.tail : {};
	        node.next = tail = {};
	        node.context = context;
	        node.callback = callback;
	        calls[event] = {tail: tail, next: list ? list.next : node};
	      }

	      return this;
	    },

	    // Remove one or many callbacks. If `context` is null, removes all callbacks
	    // with that function. If `callback` is null, removes all callbacks for the
	    // event. If `events` is null, removes all bound callbacks for all events.
	    off: function(events, callback, context) {
	      var event, calls, node, tail, cb, ctx;

	      // No events, or removing *all* events.
	      if (!(calls = this._callbacks)) return;
	      if (!(events || callback || context)) {
	        delete this._callbacks;
	        return this;
	      }

	      // Loop through the listed events and contexts, splicing them out of the
	      // linked list of callbacks if appropriate.
	      events = events ? events.split(eventSplitter) : utils.keys(calls);
	      while (event = events.shift()) {
	        node = calls[event];
	        delete calls[event];
	        if (!node || !(callback || context)) continue;
	        // Create a new list, omitting the indicated callbacks.
	        tail = node.tail;
	        while ((node = node.next) !== tail) {
	          cb = node.callback;
	          ctx = node.context;
	          if ((callback && cb !== callback) || (context && ctx !== context)) {
	            this.on(event, cb, ctx);
	          }
	        }
	      }

	      return this;
	    },

	    // Trigger one or many events, firing all bound callbacks. Callbacks are
	    // passed the same arguments as `trigger` is, apart from the event name
	    // (unless you're listening on `"all"`, which will cause your callback to
	    // receive the true name of the event as the first argument).
	    trigger: function(events) {
	      var event, node, calls, tail, args, all, rest;
	      if (!(calls = this._callbacks)) return this;
	      all = calls.all;
	      events = events.split(eventSplitter);
	      rest = slice.call(arguments, 1);

	      // For each event, walk through the linked list of callbacks twice,
	      // first to trigger the event, then to trigger any `"all"` callbacks.
	      while (event = events.shift()) {
	        if (node = calls[event]) {
	          tail = node.tail;
	          while ((node = node.next) !== tail) {
	            node.callback.apply(node.context || this, rest);
	          }
	        }
	        if (node = all) {
	          tail = node.tail;
	          args = [event].concat(rest);
	          while ((node = node.next) !== tail) {
	            node.callback.apply(node.context || this, args);
	          }
	        }
	      }

	      return this;
	    }

	  };

	  return Events;

	}).call( this, utils );


	// 	utils.extend  -------------------------------------------------------------------------
	//	Provides inheritance from a constructor.
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

	// 	mapfacade  ---------------------------------------------------------------------------
	//	List of methods that can be performed on a Modules Map
	var MapFacade = (function(){

		// The sandboxed literal that is returned when a map is created.
		function MapFacade( map ){
			this._map = map;	
		}

		MapFacade.prototype = {
			add : function( name, object ){
				return this._map.SET_SINGLE.apply( this._map, arguments );
			},
			get : function( name ){
				return this._map.GET_SINGLE.apply( this._map, arguments );
			},
			each : function( callbackOrMethod, contextOrArgs ){
				if( typeof callbackOrMethod == 'string' ){
					return this._map.INVOKE_MULTIPLE_METHOD.apply( this._map, arguments );
				} else
				if( typeof callbackOrMethod == 'function' ){
					return this._map.INVOKE_MULTIPLE_CALLBACK.apply( this._map, arguments );
				}
			},
			eachTry : function( methodName, args ){
				return this._map.INVOKE_MULTIPLE_METHOD_IF_EXISTS.apply( this._map, arguments );
			},
			remove : function( name ){
				if( typeof name == 'undefined'){
					return this._map.REMOVE_MULTIPLE.apply( this._map, arguments );
				} else
				if( typeof name == 'string'){
					return this._map.REMOVE_SINGLE.apply( this._map, arguments );
				}
			},
			on : function( subject, callback, context ){
				var fn = function( obj, name ){
					obj.on( subject , function(){
						Array.prototype.unshift.call( arguments, obj, name );
						callback.apply( context || this._map, arguments );
					});
				};
				return this._map.INVOKE_MULTIPLE_CALLBACK.call( this._map, fn, context );
			},
			off : function( subject ){
				Array.prototype.unshift.call( arguments, 'off' );
				return this._map.INVOKE_MULTIPLE_METHOD.apply( this._map, arguments );
			}
		}

		return MapFacade;

	})();

	// 	mapresolver  -------------------------------------------------------------------------
	//	Core map functions allowing a maps objects to be accessed and manipulated.
	var MapResolver = (function( utils, eventsAggregator, MapFacade ){

		function MapResolver( module, map ){

			// where we store all objects within the map.
			this.map = map.data;

			// any matching event callbacks (get/add/remove) are called when appropriate
			this.eventCallbacks = map.callbacks || {};

			// each map is given it's own name to aid recognition and error formatting.
			this.name = map.name;

			// a reference to the main module. used to throw errors.
			this.module = module;
			
			// return a sandboxed object
			return new MapFacade( this );

		}

		MapResolver.prototype = {

			// returns the maps name
			getName : function(){
				return ( typeof this.name == 'string' ? this.name : null );
			},

			// returns map name with greater context
			getMapName : function(){
				var name = this.getName();
				return name ? ' object [inside \'' + name + '\' map]' : '';
			},	

			// fires any matching event callbacks that were set initially.	
			fireEvent : function( event, id, obj ){
				if( event && typeof this.eventCallbacks[ event ] == 'function' ){
					this.eventCallbacks[ event ].call( this.module, this.name, id, obj );
				}
			},

			// gets a single object within the map
			GET_SINGLE : function( id ){
				if( typeof this.map[ id ] === 'undefined' ){
					this.module.throwException( new Error( 'Object "' + id + '" was requested but not found.') );
				}
				this.fireEvent( 'get', id, this.map[id] );
				return this.map[ id ];
			},

			// sets a single object within the map
			SET_SINGLE : function( id, obj ){
				if( typeof obj.on === 'undefined'){
					utils.copy( obj, eventsAggregator );
				}
				this.fireEvent( 'add', id, obj );
				return this.map[id] = obj;
			},

			// removes a single object within the map
			REMOVE_SINGLE : function( id ){
				this.fireEvent( 'remove', id, this.map[id] );
				delete this.map[id];
			},

			// removes all objects within the map
			REMOVE_MULTIPLE : function(){
				for( var id in this.map ){
					this.REMOVE_SINGLE( id );
				}
			},

			// calls a method on a single object within the map. 
			INVOKE_SINGLE_METHOD : function( id, method, arg1, arg2, argN ){
				if ( this.map[ id ] ){
					try {
						if( typeof this.map[id][method] == 'function' ){
							var args = Array.prototype.slice.call( arguments, 2 );	
							return this.map[id][method].apply( this.map[id], args );
						} else {
							throw new Error( "The method '" + method + "()' is not defined on '" + id + "'" );
						}
					} catch (e) {
						var message = e.message + "\nSo method '" + method + "()' failed on '" + id + "'" + this.getMapName();
						
						if( typeof this.map[id]['throwException'] == 'function' ){
							this.map[id].throwException.call( this.map[id], e, message );
						} else {
							this.module.throwException( e, message );
						}
					}
				}
			},

			// same as above but no error if the method doesn't exist on the object.
			INVOKE_SINGLE_METHOD_IF_EXISTS : function( id, method, arg1, arg2, argN ){
				if ( this.map[ id ] && typeof this.map[id][method] == 'function' ){
					var args = Array.prototype.slice.call( arguments, 2 );
					return this.map[id][method].apply( this.map[id], args );
				}
			},

			// gets a single object within the map and then injects it into a callback
			INVOKE_SINGLE_CALLBACK : function( id, callback, context ){
				if( this.map[ id ] ){
					try {
						return callback.call( context || this.map[ id ], this.map[id], id );
					} catch (e){
						// throw recursive errors to prevent masking
						if( e.name == 'ModuleException' ){ throw e; } else {

							var message = e.message + "\nSo callback failed on '" + id + "'" + this.getMapName();

							throw this.module.throwException( e, message );
						}
					}
				}
			},

			// each object in the map is injected into the callback 
			INVOKE_MULTIPLE_CALLBACK : function( callback, context ){
				for( var id in this.map ){
					this.INVOKE_SINGLE_CALLBACK( id, callback, context );
				}
			},

			// calls a defined method on each object within the map
			INVOKE_MULTIPLE_METHOD : function( method, arg1, arg2, argN ){
				for( var id in this.map ){
					var args = Array.prototype.slice.call( arguments, 0 );
					Array.prototype.unshift.call( args, id );
					this.INVOKE_SINGLE_METHOD.apply( this, args );
				}
			},

			// calls a method on each object in the map if the method exists.
			INVOKE_MULTIPLE_METHOD_IF_EXISTS : function( method, arg1, arg2, argN ){
				for( var id in this.map ){
					var args = Array.prototype.slice.call( arguments, 0 );
					Array.prototype.unshift.call( args, id );
					this.INVOKE_SINGLE_METHOD_IF_EXISTS.apply( this, args );
				}
			}
		};

		return MapResolver;

	})( utils, eventsAggregator, MapFacade );


	//	Module ---------------------------------------------------------------------------------------
	//	Our main module object!
	var Module = ( function( utils, eventsAggregator, MapResolver ){

		// create strategy to deal with lack of $
		var nojQuery = ( typeof $ == 'undefined' ? true : false );
		var jqueryCheck = function(){
			if( nojQuery ){	this.throwException( new Error('jQuery / zepto required for DOM manipulation.') );	}
			jqueryCheck = function(){};
		}

		Module = function( opts ){

			// install events aggregator onto the Module
			utils.copy( this, eventsAggregator );

			// mergin in options onto the instance
			utils.copy( this, opts );

			// call base init function
			this._initialize();

			// call initialize function, if it's available
			if( typeof this.initialize == 'function' ){
				this.initialize();
			}

		};

		// allows constructor to be extended
		Module.extend = utils.extend;

		Module.prototype = {

			_initialize : function(){
				// set a place to store 'private' stuff.
				this._ = {};

				// set dom scope
				this.setScope( this.scope );

				// process the events selector (if provided)
				this._processEventsSelector();

			},

			// Find DOM elements within the modules $scope. $scope is a jquery reference.
			$: function(selector) {
				jqueryCheck.call( this );
				return this.$scope.find(selector);
			},

			start : function(){
				this.throwException( new Error('Start method has not been implemented on the module.'));
			},

			stop : function(){
				this.throwException( new Error('Stop method has not been implemented on the module.'));
			},

			restart : function(){
				this.throwException( new Error('Restart method has not been implemented on the module.'));
			},

			// Logs out anything to the console (if console exists), prefixing the module's name if it has one.
			log : function( message ){
				if( typeof console == 'object' && typeof console.log == 'function' ){
					var name = this._name ? this._name + ' : ' : '';
					console.log( name + message );
				}
			},

			// Sets the modules scope element $scope
			setScope : function( element ){
				if( typeof element == 'object' && typeof element.selector != 'undefined' ){
					element = element.selector;
				}
				this.scope = element;
				this.$scope = ( nojQuery ? null : $( this.scope ) );
			},

			// Shows the modules scope element ($scope) - Note, all other DOM-level activity isn't the modules responsibility.
			show : function(){
				jqueryCheck.call( this );
				this.$scope.show();
			},

			// Hides the modules scope element ($scope) - Note, all other DOM-level activity isn't the modules responsibility.
			hide : function(){
				jqueryCheck.call( this );
				this.$scope.hide();
			},		

			// Creates a map to store objects.  Returns a facade get/add/remove/each/on/off to manipulate objects in the map.
			createMap : function( name ){

				var maps = this._.maps = this._maps || {};
				maps.i = ( maps.i ? maps.i++ : 1 );
				name = ( !name ? maps.i : name );

				var map = maps[ name ] = {
					data : {},
					callbacks : this._mapEvents,
					name : name
				};

				return new MapResolver( this, map );

			},

			// Map events that are fired when we get, set or remove objects from a particular map.
			_mapEvents : {
				// get : function( mapName, objectName, object ){},
				add : function( mapName, objectName, object ){
					// give the object an alias
					if( typeof object._name === 'undefined'){
						object._name = objectName;
					}

					// hook object into any event selectors
					this._bindMapObject('on', mapName, objectName, object);		
				},
				remove : function( mapName, objectName, object ){
					// unbind object from any event selectors
					this._bindMapObject('off', mapName, objectName, object);
				}
			},

			// Takes a map key, initiates event binding.
			_bindMapObject : function( onOff, mapName, objectName, object ){
				// check for direct references
				this._bindProperty( onOff, mapName + '.' + objectName, object );
				// check for map references
				this._bindProperty( onOff, mapName, object, objectName )
			},

			// Takes a property then binds/unbinds to any matching events.
			_bindProperty : function( onOff, key, object, id ){
				var events = this._.eventsMap;
				var makeCallBack = function( fn ){
					if( typeof id !== 'undefined' ){
						// force object and Id to be passed into the event callback.
						return function(){
							Array.prototype.unshift.call( arguments, object, id );
							return fn.apply( this, arguments );
						}
					} else {
						return fn;
					}
				}
				if( events[key] ){
					for( var event in events[key] ){
						var callback = makeCallBack( events[key][event] );
						if( typeof object[onOff] !== 'function' ){
							this.throwException( new Error("Failed hooking up '" + event + "' event on '" + key + "' object as it has no " + onOff + "() method - No event aggregator is present on " + key + ".") );
						}
						object[onOff].call( object, event, callback, this );
					}
				}
			},

			// Iterates through an events property (if given), then standardizes all event selectors into a single
			// object (eventsMap) to enable look-ups.
			_processEventsSelector : function(){
				var events = this._.eventsMap = {};
				function registerEvent( key, event, callback ){
					events[key] = ( typeof events[key] == 'undefined' ? {} : events[key] );
					events[key][event] = callback;
				}
				if( typeof this.events == 'object' ){
					for( var i in this.events ){
						var selector = i.split(' '),
							key = selector[0],
							event = selector[1],
							value = this.events[i];

						if( key && !event && typeof value == 'object'){
							// we have an object literal containing multiple event / function pairs
							for( var j in value ){
								var eventKey = j,
									fn = ( typeof value[j] == 'function' ? value[j] : false );
								if( fn ) { registerEvent( key, eventKey, fn ); }
							}
						} else if( key && event && typeof value == 'function' ){
							// we have an event and function pair
							registerEvent( key, event, value )
						}
					}
				};

				// now register our property blacklist
				this._setupEventBlacklist();

			},

			// denotes any object properties that we shouldn't be able to bind against using event selectors
			_setupEventBlacklist : function(){
				var blacklist = this._.eventsBlacklist = {};

				// add any instance properties present at object construction to the blacklist
				for( var i in this ){
					if( this.hasOwnProperty(i) && typeof this[i] == 'object' ){
						blacklist[i] = i;
					}
				}
			},

			// sets events on any created objects that have matching event selectors
			// map objects are exluded from this as event selectors are automatically hooked-up on object add.
			setEvents : function(){
				var blacklist = this._.eventsBlacklist;
				for( var i in this ){
					if( this.hasOwnProperty(i) && typeof this[i] == 'object' && !blacklist[i] && !( this[i] instanceof MapFacade ) ){
						this._bindProperty( 'off', i, this[i] );  // unbind any previous hooks
						this._bindProperty( 'on', i, this[i] );   // now bind to any event declarations
					}
				}
			},		

			// Throws out an error, triggers an error event (allows error chaining and improved error messaging).
			throwException : function( error, message ){

				var previousMessage = ( message ? message.split('\n')[0] : '' ),
					latestMessage;
		
				if( message ){
					var errorInfo = ( this._tag ? 'Occured on "' + this._tag + '" Object:' : '' );
					if( previousMessage && previousMessage == errorInfo ){
						error.message = latestMessage = message;
					} else {
						error.message = latestMessage = ( errorInfo ? errorInfo + '\n' : '' ) + message;
					}
				} else {
					if( error && error.message ){ latestMessage = error.message; }
				}
				this.trigger('error', latestMessage, error );
				throw error;
			}		

		};

		return Module;

	})( utils, eventsAggregator, MapResolver );

	// Export nicely.
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = Module;
		}
		exports.Module = Module;
	} else if (typeof define === 'function' && define.amd) {
		define('underscore', function() {
		 	return Module;
		});
	} else {
		root['Module'] = Module;
	}

}).call(this);