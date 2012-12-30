describe("Module", function() {

	describe('Map.checkName', function(){

		beforeEach(function() {
			// create a map resolver.  by default this will return a map facade
			mapFacade = new Map( 'testMap' );
			// get hold of the original from the map facade
			map = mapFacade._map;
			// strategy to check the name
			checkName = function( name ){
				return function(){
					map.checkName( name );
				};
			};

		});

		it('Should throw an error when a string or int is not provided', function(){
			// our valid cases
			expect( checkName( 'test' ) ).not.toThrow();
			expect( checkName( 1 ) ).not.toThrow();

			// our invalid cases
			expect( checkName( {} ) ).toThrow();
			expect( checkName( null ) ).toThrow();
			expect( checkName( undefined ) ).toThrow();
		});

		it('Should throw an error when a string is empty', function(){
			expect( checkName('') ).toThrow();
			expect( checkName(' ') ).toThrow();
		});

	});
	
	describe("Map", function() {

		var mapFacade,
			map;

		beforeEach(function() {
			// create a map resolver.  by default this will return a map facade
			mapFacade = new Map( 'testMap' );
			// get hold of the original from the map facade
			map = mapFacade._map;
		});

		it('Should correctly store its map name', function() {
			expect( map.getName() ).toBe( 'testMap' );
		});

		it('Should allow map array to be retrieved', function() {
			var testItem = {
				test : 'ing'
			};
			var mapArray = new MapArray();
			mapArray.add( testItem );

			// add in the map array manually
			map.arrays.testObject = mapArray;

			var retrievedObject = map.GET_SINGLE( 'testObject' );

			expect( retrievedObject ).toBeDefined();
			expect( retrievedObject.test ).toBe( 'ing' );
		});

		it('Should allow single map arrays to be added', function() {
			map.SET_SINGLE( 'test', { a : 'curlyWurly' } );
			var obj = map.GET_SINGLE('test');
			expect( obj.a ).toBe('curlyWurly');
		});

		it('Should allow single map arrayss to be removed', function() {
			map.SET_SINGLE( 'test', { a : 'curlyWurly' } );
			map.REMOVE_SINGLE( 'test' );

			// object should now be undefined
			var obj = map.arrays.test;
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

		it('Should allow multiple map arrays to be added', function() {
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

		it('Should allow multiple map arrays to be removed', function() {
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

		it('Should allow methods to be invoked on a single map array', function() {
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

		it('Should allow methods to be invoked on multiple map arrays', function() {
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

		it('Should allow callbacks to be invoked on a single map array', function() {
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

		it('Should allow callbacks to be invoked on multiple map arrays', function() {

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

		
		it('Should correctly fire events on add / remove', function() {
			
			// set up an object to alter in our callbacks
			var results = {
				get : {},
				add : {},
				remove : {}
			};

			// create our callbacks
			map.eventCallbacks = {
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

			map.callbacksContext = this;

			// now add, get and remove
			map.SET_MULTIPLE({
				'testObject':{ a : 2 }
			});
			map.REMOVE_SINGLE('testObject');

			// test add callback execution
			expect( results.add.mapName ).toBe( 'testMap' );
			expect( results.add.objectName ).toBe( 'testObject' );
			expect( results.add.obj.a ).toBe( 2 );

			// test add callback execution
			expect( results.remove.mapName ).toBe( 'testMap' );
			expect( results.remove.objectName ).toBe( 'testObject' );
			expect( results.remove.obj.a ).toBe( 2 );

		});

		it('Should correctly fire events on add / remove for a map array containing many objects', function() {
			
			var add = 0;
			var remove = 0;

			// create our callbacks
			map.eventCallbacks = {
				add : function( mapName, objectName, object ){
					add+= object.a;
				},
				remove : function( mapName, objectName, object ){
					remove+= object.a;
				}
			};

			map.callbacksContext = this;

			// now add, get and remove
			map.SET_SINGLE( 'testObject', { a : 2 } );
			map.SET_SINGLE( 'testObject', { a : 2 } );
			map.SET_SINGLE( 'testObject', { a : 2 } );
			map.REMOVE_SINGLE('testObject');

			expect( add ).toBe( 6 );
			expect( remove ).toBe( 6 );

		});

	});

});