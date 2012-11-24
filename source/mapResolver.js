
var MapResolver = (function( copy, eventsAggregator, MapFacade ){

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
				copy( obj, eventsAggregator );
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

})( copy, eventsAggregator, MapFacade );
