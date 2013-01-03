describe("MapFacade", function() {
	
	var map,
		_internal;

	beforeEach(function() {
		// create a map resolver.  by default this will return a map facade
		map = new Map( 'testMap' );
		// get hold of the original from the map facade
		_internal = map._map;
	});	

	describe("length", function() {
		it('Should return the number of items in the map', function() {

			expect( map.length() ).toBe( 0 );

			_internal.setSingle('foo',{});
			_internal.setSingle('bar',{});
			expect( map.length() ).toBe( 2 );

			_internal.removeSingle('foo');
			expect( map.length() ).toBe( 1 );

		});
	});

	describe("add", function() {
		it('Should add a single item', function() {

			expect( map.length() ).toBe( 0 );
			map.add('foo', {} );
			expect( map.length() ).toBe( 1 );

		});
		it('Should add a multiple items', function() {

			expect( map.length() ).toBe( 0 );
			map.add({
				'foo' : {},
				'bar' : {}
			});
			expect( map.length() ).toBe( 2 );
		});
	});

	describe("get", function() {
		it('Should return a single item', function() {

			map.add('foo',{ bar : true });
			var obj = map.get('foo');

			expect( obj ).toBeDefined();
			expect( obj.bar ).toEqual( true );

		});
	});

	describe("each", function() {


		beforeEach(function() {
			x = 0;
			function Sample(){
				this.test = function( val, multiplier ){
					x = x + ( val * multiplier );
				};
			}
			map.add({
				'first' : new Sample(),
				'second' : new Sample(),
				'third' : new Sample()
			});

		});		

		it('Should invoke a method on each item in the map', function() {
			expect( x ).toBe( 0 );
			map.each('test', 5, 5 );
			expect( x ).toBe( 75 );
		});

		it('Should apply a callback on each item in the map', function() {
			expect( x ).toBe( 0 );
			map.each( function( item, itemName ){
				item.test( 5, 5 );
			});
			expect( x ).toBe( 75 );
		});

	});

	describe("eachTry", function() {

		it('Should invoke a method on each item in the map if it exists', function() {
			x = 0;
			function Sample(){
				this.test = function( val, multiplier ){
					x = x + ( val * multiplier );
				};
			}
			map.add({
				'first' : new Sample(),
				'second' : new Sample(),
				'third' : {}
			});

			expect( x ).toBe( 0 );
			map.eachTry('test', 5, 5 );
			expect( x ).toBe( 50 );

		});

	});

	describe("remove", function() {

		beforeEach(function() {
			x = 0;
			function Sample(){
				this.test = function( val, multiplier ){
					x = x + ( val * multiplier );
				};
			}
			map.add({
				'first' : new Sample(),
				'second' : new Sample(),
				'third' : new Sample(),
				'fourth' : new Sample()
			});

		});		

		it('Should remove one item from the map', function() {
			expect( map.length() ).toBe( 4 );
			map.remove('first');
			expect( map.length() ).toBe( 3 );

			var shouldError = function(){
				map.get('first');
			};

			expect( shouldError ).toThrow();
		});

		it('Should remove all items from the map', function() {
			expect( map.length() ).toBe( 4 );
			map.remove();
			expect( map.length() ).toBe( 0 );
		});

	});	

});