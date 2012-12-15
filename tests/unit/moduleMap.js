describe("Core Module Map Resolver", function() {

	describe("MapResolver", function() {

		var mapFacade,
			map;

		beforeEach(function() {
			// set our default props.
			var options = {
				data : {},
				name : 'testMap'
			};
			// create a map resolver.  by default this will return a map facade
			mapFacade = new MapResolver( options );
			// get hold of the original from the map facade
			map = mapFacade._map;
		});

		it('Should correctly store its map name', function() {
			// getName
			expect( map.getName() ).toBe( 'testMap' );
		});

		it('Should allow objects to be retrieved', function() {
			// add manually
			map.map.testObject = { a : 'curlyWurly' };

			var obj = map.GET_SINGLE('testObject');
			// then get
			expect( obj.a ).toBe('curlyWurly');
		});


		it('Should allow single objects to be added', function() {
			map.SET_SINGLE( 'test', { a : 'curlyWurly' } );
			var obj = map.GET_SINGLE('test');
			expect( obj.a ).toBe('curlyWurly');
		});

		it('Should allow single objects to be removed', function() {
			map.SET_SINGLE( 'test', { a : 'curlyWurly' } );
			map.REMOVE_SINGLE( 'test' );

			// object should now be undefined
			var obj = map.map.test;
			expect( obj ).toBeUndefined();

			// object shouldn't be accessible and should throw error
			var errorFn = function(){ map.GET_SINGLE( 'test'); };
			expect( errorFn ).toThrow();
		});

		it('Should maintain length correctly', function() {
			// add, remove, check length property
			map.SET_SINGLE( 'test', { a : 'curlyWurly' } );
			map.SET_SINGLE( 'test2', { a : 'curlyWurly' } );
			expect( map.length ).toBe( 2 );
			map.REMOVE_SINGLE( 'test' );
			expect( map.length ).toBe( 1 );
		});		

		it('Should allow multiple objects to be added', function() {
			map.SET_MULTIPLE({
				'test1':{ a : 'curlyWurly' },
				'test2':{ a : 'curlyShirly' },
				'test3':{ a : 'curlySausage' }
			});

			expect( map.length ).toBe( 3 );

			var test1 = map.GET_SINGLE('test1'),
				test2 = map.GET_SINGLE('test2'),
				test3 = map.GET_SINGLE('test3');

			expect( test1.a ).toBe('curlyWurly');
			expect( test2.a ).toBe('curlyShirly');
			expect( test3.a ).toBe('curlySausage');
		});

		it('Should allow multiple objects to be removed', function() {
			map.SET_MULTIPLE({
				'test1':{ a : 'curlyWurly' },
				'test2':{ a : 'curlyShirly' },
				'test3':{ a : 'curlySausage' }
			});


			expect( map.length ).toBe( 3 );
			map.REMOVE_MULTIPLE();
			expect( map.length ).toBe( 0 );

			var errorFn = function(){ map.GET_SINGLE('test1'); };
			expect( errorFn ).toThrow();
		});

		it('Should allow methods to be invoked on a single object', function() {
			var x = '';
			var method = function( arg1, arg2 ){
				x = ( arg1 ? arg1 : '' ) + ( arg2 ? arg2 : '' );
			};
			// test for multiple args
			map.SET_MULTIPLE({
				'test1':{ 
					testMethod : method
				}
			});
			expect( x ).toBe( '' );

			map.INVOKE_SINGLE_METHOD( 'test1', 'testMethod' );
			expect( x ).toBe( '' );

			map.INVOKE_SINGLE_METHOD( 'test1', 'testMethod', 'hello' );
			expect( x ).toBe( 'hello' );

			map.INVOKE_SINGLE_METHOD( 'test1', 'testMethod', 'hello', ' world' );
			expect( x ).toBe( 'hello world' );
		});

		it('Should allow methods to be invoked on multiple objects', function() {
			var x = 0;
			var method = function( arg1, arg2 ){
				x+= ( arg1 ? arg1 : 0 ) + ( arg2 ? arg2 : 0 );
			};
			// test for multiple args
			map.SET_MULTIPLE({
				'one':{ testMethod : method },
				'two':{ testMethod : method },
				'three':{ testMethod : method },
				'four':{ testMethod : method }
			});

			expect( x ).toBe( 0 );

			map.INVOKE_MULTIPLE_METHOD( 'testMethod' );
			expect( x ).toBe( 0 );

			map.INVOKE_MULTIPLE_METHOD( 'testMethod', 1 );
			expect( x ).toBe( 4 );

			map.INVOKE_MULTIPLE_METHOD( 'testMethod', 1, 2 );
			expect( x ).toBe( 16 );				
		});

		it('Should allow callbacks to be invoked on a single object', function() {
			var x = 0,
				nameRef = '',
				objRef = {},
				context;

			// test for multiple args and context
			map.SET_MULTIPLE({
				'test':{ a : 1 }
			});		

			map.INVOKE_SINGLE_CALLBACK( 'test', function( obj, name ){
				objRef = obj;
				nameRef = name;
				x = 12;
				context = this;
			}, this );

			expect( x ).toBe( 12 );
			expect( objRef.a ).toBe( 1 );
			expect( nameRef ).toBe( 'test' );
			expect( context ).toBe( this );

		});

		it('Should allow callbacks to be invoked on multiple objects', function() {

			var x = 0,
				nameString = '',
				context;

			map.SET_MULTIPLE({
				'one':{ a : 2 },
				'two':{ a : 4 },
				'three':{ a : 6 },
				'four':{ a : 8 }
			});

			map.INVOKE_MULTIPLE_CALLBACK( function( obj, name ){
				nameString += name;
				x += obj.a;
				context = this;
			}, this );

			expect( x ).toBe( 20 );
			expect( nameString ).toBe( 'onetwothreefour' );
			expect( context ).toBe( this );

		});

		it('Should correctly fire events on add / get / remove', function() {
			
			// set up an object to alter in our callbacks
			results = {
				get : {},
				add : {},
				remove : {}
			};

			// create our callbacks
			map.eventCallbacks = {
				get : function( mapName, objectName, object ){
					results.get.mapName = mapName;
					results.get.objectName = objectName;
					results.get.obj = object;
				},
				add : function( mapName, objectName, object ){
					results.add.mapName = mapName;
					results.add.objectName = objectName;
					results.add.obj= object;
				},
				remove : function( mapName, objectName, object ){
					results.remove.mapName = mapName;
					results.remove.objectName = objectName;
					results.remove.obj = object;
				}
			};

			// now add, get and remove
			map.SET_MULTIPLE({
				'testObject':{ a : 2 }
			});
			map.GET_SINGLE('testObject');
			map.REMOVE_SINGLE('testObject');

			// test add callback execution
			expect( results.add.mapName ).toBe( 'testMap' );
			expect( results.add.objectName ).toBe( 'testObject' );
			expect( results.add.obj.a ).toBe( 2 );

			// test get callback execution
			expect( results.get.mapName ).toBe( 'testMap' );
			expect( results.get.objectName ).toBe( 'testObject' );
			expect( results.get.obj.a ).toBe( 2 );

			// test add callback execution
			expect( results.remove.mapName ).toBe( 'testMap' );
			expect( results.remove.objectName ).toBe( 'testObject' );
			expect( results.remove.obj.a ).toBe( 2 );

		});

	});

});