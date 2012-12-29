
var Mapping = (function(){

	function Mapping(){
		this._items = [];
		this.count = 0;
	}

	Mapping.prototype = {

		// add an item to the mapping
		add : function( obj, success, context ){
			// increment the count, set unique id, then add to the items array
			this.count++;
			obj._mappingId = this.count;
			this._items.push( obj );

			if( typeof success === 'function' ){
				success.call( context || this, obj );
			}
			return this;
		},

		// remove an item from the mapping
		remove : function( itemId, success, context ){

			var callSuccess = function( item ){
				if( typeof success === 'function' ){
					success.call( context || this, item );
				}
			};
			
			this.each( function( item, arrayIndex ){
				if( itemId && item._mappingId === itemId ){
					// an item id has been passed in - try to remove a unique item
					this._items.splice( arrayIndex, 1 );
					callSuccess( item );
					return false;
				}
				callSuccess( item );
			});

			if( !itemId ){
				this._items.length = 0;
			}

			return this;
		},

		// iterates over each of the available items
		each : function( fn, context ){
			for( var i = 0; i < this._items.length; i++ ){
				var proceed = fn.call( context || this, this._items[i], i );
				// if the function returns false then we break out of the loop.
				if( proceed === false ){
					break;
				}
			}
		},

		// returns all of the items within the mapping
		getItems : function(){
			return this._items;
		}

	};

	return Mapping;

})();
