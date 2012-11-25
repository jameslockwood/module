var Module = ( function( copy, eventsAggregator, extend, MapResolver ){

	// create strategy to deal with lack of $
	var nojQuery = ( typeof $ == 'undefined' ? true : false );
	var jqueryCheck = function(){
		if( nojQuery ){	this.throwException( new Error('jQuery / zepto required for DOM manipulation.') );	}
		jqueryCheck = function(){};
	}

	Module = function( opts ){

		// install events aggregator onto the Module
		copy( this, eventsAggregator );

		// mergin in options onto the instance
		copy( this, opts );

		// call base init function
		this._initialize();

		// call initialize function, if it's available
		if( typeof this.initialize == 'function' ){
			this.initialize();
		}

	};

	// allows constructor to be extended
	Module.extend = extend;

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

		// sets events on any newly created objects.
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

})( copy, eventsAggregator, extend, MapResolver );


