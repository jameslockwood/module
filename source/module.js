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


