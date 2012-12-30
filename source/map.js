
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
