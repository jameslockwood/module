
var MapArray = (function(){

	// A map array is stored within a map ( with an associative value )
	// Each map array can contain one to many items.
	// Each item within the map array has it's own identifier.
	
	function MapArray(){
		this._items = [];
		this.count = 0;
	}

	MapArray.prototype = {

		// add an item to the map array
		add : function( obj, success, context ){
			// increment the count, set unique id, then add to the items array
			this.count++;
			obj._mapArrayId = this.count;
			this._items.push( obj );

			if( typeof success === 'function' ){
				success.call( context || this, obj );
			}
			return this;
		},

		// remove an item from the map array
		remove : function( itemId, success, context ){

			var callSuccess = function( item ){
				if( typeof success === 'function' ){
					success.call( context || this, item );
				}
			};
			
			this.each( function( item, arrayIndex ){

				if( itemId && item._mapArrayId === itemId ){
					// an item id has been passed in - try to remove a unique item
					this._items.splice( arrayIndex, 1 );
					callSuccess( item );
					return false;
				} else if( !itemId ){
					// no item has been passed in, so all items are to be removed
					// therefore call success item then empty array afterwards.
					callSuccess( item );
				}
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

		// returns all of the items within the map array
		getItems : function(){
			return this._items;
		}

	};

	return MapArray;

})();
