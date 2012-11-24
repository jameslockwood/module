
var MapFacade = (function(){

	// The sandboxed literal that is returned when a map is created.
	function MapFacade( root ){
		
		return {
			add : function( name, object ){
				return root.SET_SINGLE.apply( root, arguments );
			},
			get : function( name ){
				return root.GET_SINGLE.apply( root, arguments );
			},
			each : function( callbackOrMethod, contextOrArgs ){
				if( typeof callbackOrMethod == 'string' ){
					return root.INVOKE_MULTIPLE_METHOD.apply( root, arguments );
				} else
				if( typeof callbackOrMethod == 'function' ){
					return root.INVOKE_MULTIPLE_CALLBACK.apply( root, arguments );
				}
			},
			eachTry : function( methodName, args ){
				return root.INVOKE_MULTIPLE_METHOD_IF_EXISTS.apply( root, arguments );
			},
			remove : function( name ){
				if( typeof name == 'undefined'){
					return root.REMOVE_MULTIPLE.apply( root, arguments );
				} else
				if( typeof name == 'string'){
					return root.REMOVE_SINGLE.apply( root, arguments );
				}
			},
			on : function( subject, callback, context ){
				var fn = function( obj, name ){
					obj.on( subject , function(){
						Array.prototype.unshift.call( arguments, obj, name );
						callback.apply( context || root, arguments );
					});
				};
				return root.INVOKE_MULTIPLE_CALLBACK.call( root, fn, context );
			},
			off : function( subject ){
				Array.prototype.unshift.call( arguments, 'off' );
				return root.INVOKE_MULTIPLE_METHOD.apply( root, arguments );
			}
		}	
	}

	return MapFacade;

})();
