
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
