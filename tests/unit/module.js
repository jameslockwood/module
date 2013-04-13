describe("Module Constructor", function() {

	describe("instantiation", function() {
		it('Should accept properties onto the prototype', function() {
			var MyConstructor = Module.extend({
				'a' : true,
				'b' : false
			});
			var prototypeSet = new MyConstructor();
			expect( prototypeSet.a ).toBe( true );
			expect( prototypeSet.b ).toBe( false );
		});
		it('Should accept properties onto the instance', function() {
			var instanceModule = new Module({
				'a' : 1,
				'b' : 5
			});
			expect( instanceModule.a ).toBe( 1 );
			expect( instanceModule.b ).toBe( 5 );
		});
		it('Should call initialize() on instantiation', function() {
			var test = null;
			var _test = null;
			var testModule = new Module({
				initialize : function(){
					test = true;
				},
				_initialize : function(){
					_test = true;
				}
			});
			expect( test ).toBe( true );
			expect( _test ).toBe( true );
		});
	});


	describe("module scope", function() {
		it('Should allow scope to be set and re-set', function() {
			// set on init
			var testModule = new Module({ scope:'.testDom'});
			expect( testModule.scope ).toBe('.testDom');

			// set manually
			testModule.setScope('.anotherDomSelector');
			expect( testModule.scope ).toBe('.anotherDomSelector');
		});
	});

	describe("createMap", function() {
		it('Should return a map facade to interract with objects', function() {
			var testModule = new Module();
			var map = testModule.createMap();
			var comparator = ( map instanceof MapFacade );
			expect( comparator ).toBe( true );
		});
		it('Should update the map count accordigly', function() {
			var testModule = new Module();
			testModule.createMap();
			testModule.createMap();
			testModule.createMap();
			expect( testModule._.mapCount ).toBe( 3 );
		});
	});

});