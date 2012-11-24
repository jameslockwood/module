
var MapResolver = (function( copy, eventsAggregator ){

	function MapResolver( module, mapping ){

		this.mapping = mapping.data;
		this.callbacks = mapping.callbacks || {};
		this.alias = mapping.alias;
		this.module = module;

		var root = this;

		// return object literal so public interface has _NO_ visibility of the instance or prototype
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
		};

	}

	MapResolver.prototype = {
		getAlias : function(){
			return ( typeof this.alias == 'string' ? this.alias : null );
		},
		getMappedAlias : function(){
			var alias = this.getAlias();
			return alias ? ' object [inside \'' + alias + '\' mapping]' : '';
		},		
		fireEvent : function( event, id, obj ){
			if( event && typeof this.callbacks[ event ] == 'function' ){
				this.callbacks[ event ].call( this.module, this.alias, obj, id );
			}
		},
		GET_SINGLE : function( id ){
			if( typeof this.mapping[ id ] === 'undefined' ){
				this.module.throwException( new Error( 'Object "' + id + '" was requested but not found.') );
			}
			this.fireEvent( 'get', id, this.mapping[id] );
			return this.mapping[ id ];
		},
		SET_SINGLE : function( id, obj ){
			if( typeof obj.on === 'undefined'){
				copy( obj, eventsAggregator );
			}
			this.fireEvent( 'add', id, obj );
			return this.mapping[id] = obj;
		},
		REMOVE_SINGLE : function( id ){
			this.fireEvent( 'remove', id, this.mapping[id] );
			delete this.mapping[id];
		},
		REMOVE_MULTIPLE : function(){
			for( var id in this.mapping ){
				this.REMOVE_SINGLE( id );
			}
		},
		INVOKE_SINGLE_METHOD : function( id, method, arg1, arg2, argN ){
			if ( this.mapping[ id ] ){
				try {
					if( typeof this.mapping[id][method] == 'function' ){
						var args = Array.prototype.slice.call( arguments, 2 );	
						return this.mapping[id][method].apply( this.mapping[id], args );
					} else {
						throw new Error( "The method '" + method + "()' is not defined on '" + id + "'" );
					}
				} catch (e) {
					var message = e.message + "\nSo method '" + method + "()' failed on '" + id + "'" + this.getMappedAlias();
					
					if( typeof this.mapping[id]['throwException'] == 'function' ){
						this.mapping[id].throwException.call( this.mapping[id], e, message );
					} else {
						this.module.throwException( e, message );
					}
				}
			}
		},
		INVOKE_SINGLE_METHOD_IF_EXISTS : function( id, method, arg1, arg2, argN ){
			if ( this.mapping[ id ] && typeof this.mapping[id][method] == 'function' ){
				var args = Array.prototype.slice.call( arguments, 2 );
				return this.mapping[id][method].apply( this.mapping[id], args );
			}
		},
		INVOKE_SINGLE_CALLBACK : function( id, callback, context ){
			if( this.mapping[ id ] ){
				try {
					return callback.call( context || this.mapping[ id ], this.mapping[id], id );
				} catch (e){
					// throw recursive errors to prevent masking
					if( e.name == 'ModuleException' ){ throw e; } else {

						var message = e.message + "\nSo callback failed on '" + id + "'" + this.getMappedAlias();

						throw this.module.throwException( e, message );
					}
				}
			}
		},
		INVOKE_MULTIPLE_CALLBACK : function( callback, context ){
			for( var id in this.mapping ){
				this.INVOKE_SINGLE_CALLBACK( id, callback, context );
			}
		},
		INVOKE_MULTIPLE_METHOD : function( method, arg1, arg2, argN ){
			for( var id in this.mapping ){
				var args = Array.prototype.slice.call( arguments, 0 );
				Array.prototype.unshift.call( args, id );
				this.INVOKE_SINGLE_METHOD.apply( this, args );
			}
		},
		INVOKE_MULTIPLE_METHOD_IF_EXISTS : function( method, arg1, arg2, argN ){
			for( var id in this.mapping ){
				var args = Array.prototype.slice.call( arguments, 0 );
				Array.prototype.unshift.call( args, id );
				this.INVOKE_SINGLE_METHOD_IF_EXISTS.apply( this, args );
			}
		}
	};

	return MapResolver;

})( copy, eventsAggregator );
