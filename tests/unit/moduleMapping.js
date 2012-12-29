describe("Core Module Mapping", function() {

	describe('Mapping', function(){

		beforeEach(function() {
			mapping = new Mapping();
		});

		it('Should allow items to be retrieved', function(){
			var items = mapping.getItems();
			// should be an array and empty
			expect( ( items instanceof Array ) ).toBe(true);
			expect( items.length ).toBe( 0 );
		});

		it('Should allow items to be added', function(){
			mapping.add( { test : 'ing' } ).add( { test : 'hello' } );

			// check items have been added
			expect( mapping.getItems().length ).toBe( 2 );
			expect( mapping.getItems()[0].test ).toBe( 'ing' );
			expect( mapping.getItems()[1].test ).toBe( 'hello' );
		});

		it('Should assign iterative unique IDs properly', function(){
			mapping.add({}).add({});

			// check mapping ID's are iterating properlt
			expect( mapping.getItems()[0]._mappingId ).toBe( 1 );
			expect( mapping.getItems()[1]._mappingId ).toBe( 2 );
		});

		it('Should allow all items to be removed', function(){
			mapping.add({}).add({});
			expect( mapping.getItems().length ).toBe( 2 );
			mapping.remove();
			expect( mapping.getItems().length ).toBe( 0 );
		});

		it('Should allow unique items to be removed', function(){
			mapping.add({}).add({}).add({}).add({});

			var uniqueId = mapping.getItems()[1]._mappingId;

			mapping.remove( uniqueId );

			var items = mapping.getItems();

			// ensure the correct number of items have been removed
			expect( items.length ).toBe( 3 );

			// make sure the correct unique item has been removed
			for( var i in items ){
				expect( items[i]._mappingId ).not.toBe( uniqueId );
			}

		});

		it('Should allow items to be iterated over', function(){

			mapping.add({ test : 1 }).add({ test : 2 }).add({ test : 3 });

			var total = 0;
			mapping.each( function( item ){
				total += item.test;
			});
			expect( total ).toBe( 6 );
			
		});

	});

});