
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
