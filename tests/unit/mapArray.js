describe("Module", function() {

	describe('MapArray', function(){

		beforeEach(function() {
			mapArray = new MapArray();
		});

		it('Should allow items to be retrieved', function(){
			var items = mapArray.getItems();
			// should be an array and empty
			expect( ( items instanceof Array ) ).toBe(true);
			expect( items.length ).toBe( 0 );
		});

		it('Should allow items to be added', function(){
			mapArray.add( { test : 'ing' } ).add( { test : 'hello' } );

			// check items have been added
			expect( mapArray.getItems().length ).toBe( 2 );
			expect( mapArray.getItems()[0].test ).toBe( 'ing' );
			expect( mapArray.getItems()[1].test ).toBe( 'hello' );
		});

		it('Should assign iterative unique IDs properly', function(){
			mapArray.add({}).add({});

			// check mapArray ID's are iterating properlt
			expect( mapArray.getItems()[0]._mapArrayId ).toBe( 1 );
			expect( mapArray.getItems()[1]._mapArrayId ).toBe( 2 );
		});

		it('Should allow all items to be removed', function(){
			mapArray.add({}).add({});
			expect( mapArray.getItems().length ).toBe( 2 );
			mapArray.remove();
			expect( mapArray.getItems().length ).toBe( 0 );
		});

		it('Should allow unique items to be removed', function(){
			mapArray.add({}).add({}).add({}).add({});

			var uniqueId = mapArray.getItems()[1]._mapArrayId;

			mapArray.remove( uniqueId );

			var items = mapArray.getItems();

			// ensure the correct number of items have been removed
			expect( items.length ).toBe( 3 );

			// make sure the correct unique item has been removed
			for( var i in items ){
				expect( items[i]._mapArrayId ).not.toBe( uniqueId );
			}

		});

		it('Should allow items to be iterated over', function(){

			mapArray.add({ test : 1 }).add({ test : 2 }).add({ test : 3 });

			var total = 0;
			mapArray.each( function( item ){
				total += item.test;
			});
			expect( total ).toBe( 6 );
			
		});

	});

});