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
			this.setScope( this.scope );
			this._setupEvents();
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

		// Creates a map to store objects.  Returns a facade get/set/delete/each/on/off to manipulate the map.
		createMap : function( name ){

			this._maps = this._maps || {};
			this._maps.i = this._maps.i || 0;
			this._maps.i++;

			name = ( !name ? this._maps.i : name );

			var map = this._maps[ name ] = {
				data : {},
				callbacks : this.mapEvents,
				name : name
			};

			return new MapResolver( this, map );

		},

		// Map events that are fired when we get, set or remove objects from a particular map.
		mapEvents : {
			get : function( mapName, objectName, object ){
				// do something
			},
			add : function( mapName, objectName, object ){
				// give the object an alias
				if( typeof object._name === 'undefined'){
					object._name = objectName;
				}
				this.bindMapping('on', mapName, objectName, object);		
			},
			remove : function( mapName, objectName, object ){
				this.bindMapping('off', mapName, objectName, object);
			}
		},

		// Takes a map key, initiates event binding.
		bindMapping : function( onOff, mapName, objectName, object ){
			// check for direct references
			this.bindKey( onOff, mapName + '.' + objectName, object );
			// check for map references
			this.bindKey( onOff, mapName, object, objectName )
		},

		// Takes a map key then binds/unbinds to any matching events.
		bindKey : function( onOff, key, object, id ){
			var events = this.eventsMap;
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
					object[onOff].call( object, event, callback, this );
				}
			}
		},

		// Iterates through an events property (if given), then standardizes all event handlers into a single
		// object (eventsMap) to enable look-ups.
		_setupEvents : function(){
			var events = this.eventsMap = {};
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
			}
		},

		// Traverse the up prototype chain and call all matched methods bottom (base 'class') upwards.
		_traversePrototypeChain : function( method ){
			if( typeof this[method] !== 'function' ){ return;}

			var funcs = [],
				traverse = function( obj ){
					if( typeof obj[method] == 'function' ){
						storeFunction( obj[method] );
					}
					// IE doesnt support getPrototypeOf, so using __proto__ at the moment.  :(
					if( obj.__proto__ ){
						arguments.callee( obj.__proto__ );
					}
				},
				storeFunction = function( fn ){
					var match = false;
					for ( var i in funcs ){
						match = ( funcs[i] === fn ? true : match );
						if( match ){ break; }
					}
					if( !match ){
						funcs.unshift( fn );
					}
				},
				args = Array.prototype.slice.call( arguments, 1 );

			traverse( this );

			try{
				for ( var i in funcs ){
					funcs[i].apply( this, args );
				}
			} catch ( e ){
				var message = e.message + '\nMethod ' + method + '() Failed';
				this.throwException( e, new Error(message) );
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


