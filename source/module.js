var Module = ( function( copy, eventsAggregator, extend, MapResolver ){

	// create strategy to deal with no jquery
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

		// call initialize function if it's available
		if( typeof this.initialize == 'function' ){
			this.initialize();
		}

	};

	Module.extend = extend;

	Module.prototype = {

		// base initialize function. required on all instances.
		_initialize : function(){
			this.setScope( this.scope );
		},

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

		log : function( message ){
			if( typeof console == 'object' && typeof console.log == 'function' ){
				var alias = this._alias ? this._alias + ' : ' : '';
				console.log( alias + message );
			}
		},

		// Assigns utility getters / setters / delete, events etc to an object
		createMap : function( alias ){

			this._internals = this._internals || {};
			this._internals._count = this._internals._count || 0;
			this._internals._count++;

			alias = ( !alias ? this._internals._count : alias );
			
			var mapping = this._internals[ alias ] = this._internals[ alias ] || {
				data : {},
				callbacks : this.mapEvents || {},
				alias : alias
			};

			return new MapResolver( this, mapping );
			
		},

		// fired whenever these actions are made against a mapping.
		mapEvents : {
			get : function( mapping, object, id ){
				this.log('hey im getting ' + id + ' from ' + mapping )
			},
			add : function( mapping, object, id ){
				this.log('hey im adding ' + id  + ' to ' + mapping );

				// give the object an alias
				if( typeof object._alias === 'undefined'){
					object._alias = id;
				}

				// set our events				
			},
			remove : function( mapping, object, id ){
				this.log('hey im removing ' + id  + ' from ' + mapping );
			}
		},

		setScope : function( element ){
			if( typeof element == 'object' && typeof element.selector != 'undefined' ){
				element = element.selector;
			}
			this.scope = element;
			this.$scope = ( nojQuery ? null : $( this.scope ) );
		},

		show : function(){
			jqueryCheck.call( this );
			this.$scope.show();
		},

		hide : function(){
			jqueryCheck.call( this );
			this.$scope.hide();
		},

		// Traverse the prototype chain and call all matched methods bottom (base 'class') upwards.
		_traversePrototype : function( method ){
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
				this.throwException( e, message );
			}

		},

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


