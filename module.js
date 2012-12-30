/*! module - v0.2.0 - 2012-12-30
* https://github.com/jameslockwood/module
* Copyright (c) 2012 James Lockwood; Licensed MIT */

(function(){
	
var root = this;
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



var MapFacade = (function(){

	// Abstracts away from the Map constructor.
	// This facade is returned when a map is instantiated.

	function MapFacade( map ){
		this._map = map;
	}

	MapFacade.prototype = {

		// adds objects to the map.  takes name [string], object [object],  or an object containing multiple objects to add.
		add : function( name, object ){
			if( typeof name == 'object' && typeof object == 'undefined'){
				// object passed in to set multiple at one
				this._map.setMultiple.apply( this._map, arguments );
				return this;
			} else {
				// single set.
				return this._map.setSingle.apply( this._map, arguments );
			}
		},

		// returns an object in the map of 'name' [string]
		get : function( name ){
			return this._map.getSingle.apply( this._map, arguments );
		},

		// iterates over each of our objects in the map
		each : function( callbackOrMethod, contextOrArgs ){
			if( typeof callbackOrMethod == 'string' ){
				this._map.invokeMultipleMethod.apply( this._map, arguments );
			} else
			if( typeof callbackOrMethod == 'function' ){
				this._map.invokeMultipleCallback.apply( this._map, arguments );
			}
			return this;
		},

		// tries to invoke a method on each object in the map, but doesn't error if the method is not found.
		eachTry : function( methodName, args ){
			this._map.invokeMultipleMethodIfExists.apply( this._map, arguments );
			return this;
		},

		// removes one / all of the objects in the map
		remove : function( name, optionalMapItemId ){
			if( typeof name == 'undefined'){
				this._map.removeMultiple.apply( this._map, arguments );
			} else
			if( typeof name == 'string'){
				this._map.removeSingle.apply( this._map, arguments );
			}
			return this;
		},

		// applies an even listener to all of the object in the map
		on : function( subject, callback, context ){
			var fn = function( obj, name ){
				obj.on( subject , function(){
					Array.prototype.unshift.call( arguments, obj, name );
					callback.apply( context || this._map, arguments );
				});
			};
			this._map.invokeMultipleCallback.call( this._map, fn, context );
			return this;
		},

		// removes an event listener / all events from all objects in the map
		off : function( subject ){
			Array.prototype.unshift.call( arguments, 'off' );
			this._map.invokeMultipleMethod.apply( this._map, arguments );
			return this;
		},

		// returns number of items in the mapping
		length : function(){
			return this._map.length;
		}
	};

	return MapFacade;

})();


var MapArray = (function(){

	// A map array is stored within a map ( with an associative value )
	// Each map array can contain one to many items.
	// Each item within the map array has it's own identifier.
	
	function MapArray(){
		this._items = [];
		this.count = 0;
	}

	MapArray.prototype = {

		// add an item to the map array
		add : function( obj, success, context ){
			// increment the count, set unique id, then add to the items array
			this.count++;
			obj._mapArrayId = this.count;
			this._items.push( obj );

			if( typeof success === 'function' ){
				success.call( context || this, obj );
			}
			return this;
		},

		// remove an item from the map array
		remove : function( itemId, success, context ){

			var callSuccess = function( item ){
				if( typeof success === 'function' ){
					success.call( context || this, item );
				}
			};
			
			this.each( function( item, arrayIndex ){

				if( itemId && item._mapArrayId === itemId ){
					// an item id has been passed in - try to remove a unique item
					this._items.splice( arrayIndex, 1 );
					callSuccess( item );
					return false;
				} else if( !itemId ){
					// no item has been passed in, so all items are to be removed
					// therefore call success item then empty array afterwards.
					callSuccess( item );
				}
			});

			if( !itemId ){
				this._items.length = 0;
			}

			return this;
		},

		// iterates over each of the available items
		each : function( fn, context ){
			for( var i = 0; i < this._items.length; i++ ){
				var proceed = fn.call( context || this, this._items[i], i );
				// if the function returns false then we break out of the loop.
				if( proceed === false ){
					break;
				}
			}
		},

		// returns all of the items within the map array
		getItems : function(){
			return this._items;
		}

	};

	return MapArray;

})();


var Map = (function( utils, MapFacade, MapArray ){

	// Map object that stores multiple map arrays.
	function Map( name, config ){

		config = ( typeof config == 'object' ? config : {} );

		// set our error handler
		this.errorHandler = config.errorHandler || function( e ){ throw e; };

		// check the maps name is valid
		this.checkName( name, true );

		// each map is given it's own name to aid recognition and error formatting.
		this.name = name;

		// where we store all arrays within the map.  Each array has a unique key.
		this.arrays = {};

		// any matching event callbacks (get/add/remove) are called when appropriate
		this.eventCallbacks = config.callbacks || {};

		// set context of the callbacks (if any)
		this.callbacksContext = config.callbacksContext || null;

		// states the number of items in the map
		this.length = 0;
		
		// return a sandboxed object
		return new MapFacade( this );

	}

	Map.prototype = {

		// returns the maps name
		getName : function(){
			return ( typeof this.name == 'string' ? this.name : null );
		},

		// returns map name with greater context
		getMapName : function(){
			var name = this.getName();
			return name ? ' object [inside \'' + name + '\' map]' : ' object [inside anonymous map]';
		},

		// checks that a supplied name is valid
		checkName : function( name, map ){
			// ensure that we've been provided a correct name
			if( typeof name !== 'string' && typeof name !== 'number' ){
				this.errorHandler( new Error('Name must be provided') );
			}
			if( typeof name == 'string' && ( name.split(' ').join('').length < 1 || name === '' ) ){
				this.errorHandler( new Error('Name must not be empty') );
			}
		},

		// fires any matching event callbacks that were set initially.
		fireEvent : function( event, id, obj ){
			if( event && typeof this.eventCallbacks[ event ] == 'function' ){
				this.eventCallbacks[ event ].call( this.callbacksContext, this.name, id, obj );
			}
		},

		// adds an object to a map array instance
		addToMapArray : function( id, obj ){
			var mapArray = this.getMapArray( id );
			if ( typeof mapArray === 'undefined' ){
				mapArray = this.arrays[id] = new MapArray();
			}
			// add map array, supplying on success callback
			mapArray.add( obj, function( item ){
				this.length++;
				this.fireEvent( 'add', id, item );
			}, this );
		},

		// removes a whole map array instance
		removeMapArray : function( id ){
			var mapArray = this.getMapArray( id );

			// remove map array, supplying on success callback
			mapArray.remove( undefined, function( item ){
				this.length--;
				this.fireEvent( 'remove', id, item );
				delete this.arrays[id];
			}, this );
		},

		// removes a specific object from a map array instance
		removeMapArrayItem : function( id, mapArrayItemId ){
			var mapArray = this.getMapArray( id );
			mapArray.remove( mapArrayItemId, function( item ){
				this.fireEvent( 'remove', id, item );
			}, this );
		},

		getMapArray : function( id ){
			return this.arrays[ id ];
		},

		// gets a single map array within the map
		getSingle : function( id ){
			var mapArray = this.getMapArray( id );
			if( typeof mapArray === 'undefined' ){
				this.errorHandler( new Error( 'Object "' + id + '" was requested but not found.') );
			}
			var items = mapArray.getItems();
			// if multiple items, return array
			return ( items.length == 1 ? items[0] : items );
		},

		// sets a single map array within the map
		setSingle : function( id, obj ){

			// ensure that the name is valid
			try{
				this.checkName( id );
			} catch ( e ){
				var message = e.message + "\nSo failed to add an" + this.getMapName();
				this.errorHandler( e, message );
			}

			// install events aggregator onto the object
			if( typeof obj.on === 'undefined'){
				utils.installEventsTo( obj );
			}

			// store the object into the map array
			this.addToMapArray( id, obj );

			return obj;
		},

		// sets multiple map arrays within the map
		setMultiple : function( mapArrayItems ){
			if( typeof mapArrayItems !== 'object'){
				this.errorHandler( new Error( 'Cannot set multiple map objects - map array items argument is not an object.' ) );
			}
			// for each object passed through
			for( var i in mapArrayItems ){
				var id = i,
					instance = mapArrayItems[i];
				if( typeof instance != 'object' ){
					this.errorHandler( new Error( 'Map object not found - was of type ' + typeof instance ) );
				}
				// set each instance
				this.setSingle( id, instance );
			}
			return this;
		},

		// removes a single map array, or unique item from a map array
		removeSingle : function( id, optionalMapArrayItemId ){
			if( typeof optionalMapArrayItemId === 'undefined' ){
				// remove whole map array
				this.removeMapArray( id );
			} else {
				// remove item from map array
				this.removeMapArrayItem( id, optionalMapArrayItemId );
			}
			return this;
		},

		// removes all map arrays within the map
		removeMultiple : function(){
			for( var id in this.arrays ){
				this.removeSingle( id );
			}
			return this;
		},

		// calls a method on a single map array within the map.
		invokeSingleMethod : function( id, method, arg1, arg2, argN ){
			var originalArgs = Array.prototype.slice.call( arguments, 0 );
			var mapArray = this.getMapArray( id );
			try {
				mapArray.each( function( item ){
					if( typeof item[method] == 'function' ){
						var args = originalArgs.slice( 2 );
						return item[method].apply( item, args );
					} else {
						throw new Error( 'The method "' + method + '()" is not defined on ' + id + '.');
					}
				}, this );
			} catch (e) {
				var message = e.message + "\nSo method '" + method + "()' failed on '" + id + "'" + this.getMapName();
				this.errorHandler( e, message );
			}
		},

		// same as above but no error if the method doesn't exist within the map array.
		invokeSingleMethodIfExists : function( id, method, arg1, arg2, argN ){
			var originalArgs = Array.prototype.slice.call( arguments, 0 );
			var mapArray = this.getMapArray( id );
			mapArray.each( function( item ){
				if ( typeof item[method] == 'function' ){
					var args = originalArgs.slice( 2 );
					return item[method].apply( item, args );
				}
			}, this);
		},

		// gets a single map array within the map, and then injects its contents into a callback
		invokeSingleCallback : function( id, callback, context ){
			var mapArray = this.getMapArray( id );
			mapArray.each( function( item ){
				try {
					return callback.call( context || item, item, id );
				} catch (e){
					// throw recursive errors to prevent masking
					if( e.name == 'ModuleException' ){ throw e; } else {
						var message = e.message + "\nSo callback failed on '" + id + "'" + this.getMapName();
						this.errorHandler( e, message );
					}
				}
			});
		},

		// each map array in the map injects its contents into the callback
		invokeMultipleCallback : function( callback, context ){
			for( var id in this.arrays ){
				this.invokeSingleCallback( id, callback, context );
			}
			return this;
		},

		// calls a defined method on each map array's contents within the map
		invokeMultipleMethod : function( method, arg1, arg2, argN ){
			for( var id in this.arrays ){
				var args = Array.prototype.slice.call( arguments, 0 );
				Array.prototype.unshift.call( args, id );
				this.invokeSingleMethod.apply( this, args );
			}
			return this;
		},

		// calls a method on each map array's contents in the map, if the method exists.
		invokeMultipleMethodIfExists : function( method, arg1, arg2, argN ){
			for( var id in this.arrays ){
				var args = Array.prototype.slice.call( arguments, 0 );
				Array.prototype.unshift.call( args, id );
				this.invokeSingleMethodIfExists.apply( this, args );
			}
			return this;
		}
	};

	return Map;

})( utils, MapFacade, MapArray );

var Module = ( function( utils, Map, MapFacade ){

	// create strategy to deal with lack of $
	var nojQuery = ( typeof $ == 'undefined' ? true : false );
	var jqueryCheck = function(){
		if( nojQuery ){	this.throwException( new Error('jQuery / zepto required for DOM manipulation.') );	}
		jqueryCheck = function(){};
	};

	Module = function( opts ){

		// install an events aggregator onto the Module
		utils.installEventsTo( this );

		// merge in in options onto the instance
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

		// base inititialize - always called to set up object properties.
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

		// Logs out anything to the console (if console exists), prefixing the module's name if it has one.
		log : function( message ){
			if( typeof console == 'object' && typeof console.log == 'function' ){
				if( this._name ){
					Array.prototype.unshift.call( arguments, this._name + ':' );
				}
				console.log.apply( console, arguments );
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

			if( typeof name !== 'undefined' && typeof name !== 'string' ){
				this.throwException( new Error('A map name must be a string.') );
			}
			this._.mapCount = ( this._.mapCount ? this._.mapCount : 0 );
			this._.mapCount++;
			name = ( !name ? this._.mapCount : name );

			var root = this;
			var mapConfig = {
				callbacks : this._mapEvents,
				callbacksContext : this,
				errorHandler : function(){
					root.throwException.apply( root, arguments );
				}
			};

			return new Map( name, mapConfig );

		},

		// Default map events that are fired when we get, set or remove objects from a particular map.
		_mapEvents : {
			add : function( mapName, objectName, object ){
				// give the object a name we can identify it with
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
			this._bindProperty( onOff, mapName, object, { name : objectName } );
		},

		// Takes a property then binds/unbinds to any matching events.
		_bindProperty : function( onOff, key, object, forceArgs ){

			// creates a callback, injecting additional arguments if required.
			var makeCallBack = function( fn ){
				if( typeof forceArgs !== 'undefined' ){
					// force object and Id to be passed into the event callback.
					return function(){
						Array.prototype.unshift.call( arguments, object, forceArgs.name );
						return fn.apply( this, arguments );
					};
				} else {
					return fn;
				}
			};

			// iterates through an object containinn events and associated callbacks to bind.
			var setBindings = function( handlersObject ){
				for( var event in handlersObject ){
					// get array of event handlers associated with that event
					var callbacks = handlersObject[event];
					for ( var i in callbacks ){

						// for each callback, bind it to the object in question
						var callback = makeCallBack( callbacks[i] );
						if( typeof object[onOff] !== 'function' ){
							this.throwException( new Error("Failed hooking up '" + event + "' event on '" + key + "' object as it has no " + onOff + "() method - No event aggregator is present on " + key + ".") );
						}
						object[onOff].call( object, event, callback, this );
					}
				}
			};

			// get an object containing arrays of event handlers associated with this key
			var eventHandlers = this._getEventHandlers( key );
			// set bindings against this
			setBindings.call( this, eventHandlers );

			// set global handlers
			if( typeof forceArgs !== 'undefined' ){
				var globalEventHandlers = this._getGlobalEventHandlers();
				setBindings.call( this, globalEventHandlers );
			}

		},

		// Iterates through an events property (if given), then standardizes all event selectors into a single
		// object (eventsMap) to enable look-ups.
		_processEventsSelector : function(){
			
			var getEventHandler = function( key, event, value ){
				if( typeof value == 'function' ){
					return value;
				} else if( typeof value == 'string' && typeof this[value] == 'function' ){
					return this[value];
				} else if( value == '-propagate' ){
					return function(){
						Array.prototype.unshift.call( arguments, event );
						this.emit.apply( this, arguments );
					};
				}
				this.throwException( new Error( value + " not found, so '"+ event + "' event could not be bound to '" + key + "' events selector." ) );
			};

			if( typeof this.events == 'object' ){
				for( var i in this.events ){
					var selector = i.split(' '),
						key = selector[0],
						event = selector[1],
						value = this.events[i],
						fn;

					if( key && !event && typeof value == 'object'){
						// we have an object literal containing multiple event / function pairs
						for( var j in value ){
							var eventKey = j;
							fn = getEventHandler.call( this, key, eventKey, value[j] );
							this._registerEventHandler( key, eventKey, fn );
						}
					} else if( key && event && value ){
						// we have an event and function pair
						fn = getEventHandler.call( this, key, event, value );
						this._registerEventHandler( key, event, fn );
					} else {
						// can't recognize the event.
					}
				}
			}

			// now register our property blacklist
			this._setupEventBlacklist();

		},

		// registers an event handler associated with a key/event pair
		_registerEventHandler : function( key, event, callback ){
			if( arguments.length !== 3 ){
				this.throwException( new Error('Cannot register event handler.  Must provide a key, an event, and a callback.') );
			}
			if( typeof callback !== 'function' ){
				this.throwException( new Error('Cannot register event handler.  Supplied callback must be a function') );
			}
			// take into account any .* declarations
			key = key.split('.*')[0];

			var events = this._.eventsMap = ( this._.eventsMap ? this._.eventsMap : {} );
			events[key] = ( typeof events[key] == 'undefined' ? {} : events[key] );
			events[key][event] = ( typeof events[key][event] == 'undefined' ? [] : events[key][event] );
			events[key][event].push( callback );
		},

		// returns an object containing arrays of event handlers associated with supplied key/event pair
		_getEventHandlers : function( key, event ){
			var events = this._.eventsMap = ( this._.eventsMap ? this._.eventsMap : {} ),
				handlers;

			if ( key && !event && events[key] ){
				handlers = events[key];
			} else if ( event && events[key] && events[key][event] ){
				handlers = events[key][event];
			} else {
				handlers = [];
			}

			return handlers;
		},

		_getGlobalEventHandlers : function(){
			var events = this._.eventsMap = ( this._.eventsMap ? this._.eventsMap : {} );
			return ( events['*'] ? events['*'] : {} );
		},

		// denotes any object properties that we shouldn't be able to bind against using event selectors
		_setupEventBlacklist : function(){
			// add any custom blacklist properties that we won't want anyone to be able to bind against.
			var blacklist = this._.eventsBlacklist = {
				'_callbacks' : true
			};

			// now add any instance properties present at object construction to the blacklist
			for( var i in this ){
				if( this.hasOwnProperty(i) && typeof this[i] == 'object' ){
					blacklist[i] = i;
				}
			}
		},

		// sets events on any created objects that have matching event selectors
		// map objects are exluded from this as event selectors are automatically hooked-up on object add.
		bindEvents : function(){
			var blacklist = this._.eventsBlacklist;
			for( var i in this ){
				if( this.hasOwnProperty(i) && typeof this[i] == 'object' && !blacklist[i] && !( this[i] instanceof MapFacade ) ){
					this._bindProperty( 'off', i, this[i], { name : i } );  // unbind any previous hooks
					this._bindProperty( 'on', i, this[i], { name : i } );   // now bind to any event declarations
				}
			}
		},

		// Throws out an error, emits an error event (allows error chaining and improved error messaging).
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
			this.emit('error', error, latestMessage );
			throw error;
		}

	};

	return Module;

})( utils, Map, MapFacade );




root.Module = Module;
}).call( this );