describe("Core Module Event Mechanism", function() {

	describe("Events", function() {

		var module;

		beforeEach(function() {
			module = new Module();
		});

		it('Should be able to register an event handler', function() {
			// register event handler
			module._registerEventHandler( 'subModules','error', function(){} );

			expect( typeof module._.eventsMap ).toBe('object');
			expect( typeof module._.eventsMap.subModules ).toBe('object');
			expect( typeof module._.eventsMap.subModules.error ).toBe('object');
			expect( module._.eventsMap.subModules.error.length ).toBe( 1 );
			expect( typeof module._.eventsMap.subModules.error[0] ).toBe('function');

			module._registerEventHandler( 'subModules','error', function(){} );
			expect( module._.eventsMap.subModules.error.length ).toBe( 2 );
			
		});

		it('Should be able to retrieve an event handler', function() {
			// get event handler
			module._registerEventHandler( 'subModules','error', function(){} );
			module._registerEventHandler( 'subModules','error', function(){} );
			module._registerEventHandler( 'subModules','error', function(){} );

			var handler = module._getEventHandlers( 'subModules', 'error' );

			expect( typeof handler ).toBe('object');
			expect( handler.length ).toBe( 3 );
			expect( typeof handler[0] ).toBe( 'function' );
		});
	
		it('Should be able to setup an events property blacklist', function() {
			// setup events blacklist
			var testModule = new Module({
				a : {},
				b : {}
			});

			var blacklist = testModule._.eventsBlacklist;

			expect( blacklist.a ).toBeDefined();
			expect( blacklist.b ).toBeDefined();
		});

		it('Should be able to process an event selector', function() {

			module.events = {
				// single object binds to single event declaration
				'dogs.rover woof' : function(){},

				// single object binds to multi event declarations
				'dogs.rover' : {
					'woof' : function(){}
				},

				// multi objects binds to single event declaration
				'dogs woof' : function(){},

				// multi objects bind to multi event declarations
				'dogs.*' : {
					'woof' : function(){}
				}
			};

			module._processEventsSelector();

			var singleHandler = module._getEventHandlers( 'dogs.rover', 'woof' );
			expect( typeof singleHandler ).toBe('object');
			expect( singleHandler.length ).toBe( 2 );
			expect( typeof singleHandler[0] ).toBe( 'function' );

			var multiHandler = module._getEventHandlers( 'dogs', 'woof' );
			expect( typeof multiHandler ).toBe('object');
			expect( multiHandler.length ).toBe( 2 );
			expect( typeof multiHandler[0] ).toBe( 'function' );

		});

		it('Should be able to process an event selector with star declarations', function() {

			module.events = {

				// multi objects binds to single event declaration
				'dogs.* woof' : function(){},

				// multi objects bind to multi event declarations
				'dogs.*' : {
					'woof' : function(){}
				}
			};

			module._processEventsSelector();

			var multiHandler = module._getEventHandlers( 'dogs', 'woof' );
			expect( typeof multiHandler ).toBe('object');
			expect( multiHandler.length ).toBe( 2 );
			expect( typeof multiHandler[0] ).toBe( 'function' );

		});

		it('Should be able to process a global star event selector', function() {

			var x = 0;
			// create our events selector
			module.events = {
				// now try apply global selector
				'* woof' : function(){ x+= 15; },

				// multi global selector
				'*' : {
					'woof' : function(){ x += 15; }
				}
			};

			// process it
			module._processEventsSelector();

			module.dog = {};

			utils.copy( module.dog, eventsAggregator );
			module.bindEvents();

			// force the property to trigger an event
			module.dog.trigger('woof');

			expect(x).toBe(30);

		});
	
		it('Should be assigned an events aggregator', function() {
			var x = 0;
			// test that they exist as functions
			expect( typeof module.on ).toBe( 'function' );
			expect( typeof module.off ).toBe( 'function' );
			expect( typeof module.trigger ).toBe( 'function' );

			// now see if they work
			module.on('test', function(){
				x = 5;
			});

			module.trigger('test');
			expect(x).toBe(5);

			// turn off all events
			module.off('test');
			module.trigger('test');
			expect(x).toBe(5);
		});

		it('Should be able to bind a property to an event', function() {
			var x = 0;
			// create our events selector
			module.events = {
				// single declaration
				'dog woof' : function(){
					x += 10;
				},

				// multi declaration
				'dog' : {
					woof : function(){
						x += 10;
					}
				}
			};
			// process it
			module._processEventsSelector();

			// now create our property with its own events aggregator that we wish to bind to
			module.dog = {};
			utils.copy( module.dog, eventsAggregator );

			// now bind the property with any declarations in our events selector
			module._bindProperty( 'on', 'dog', module.dog );

			// do multiple on/off to make sure we're unbinding properly
			module._bindProperty( 'off', 'dog', module.dog );
			module._bindProperty( 'on', 'dog', module.dog );

			// force the property to trigger an event
			module.dog.trigger('woof');

			expect(x).toBe(20);

		});

		it('Should be able to bind properties to an event selector', function() {
			var x = 0;
			// create our events selector
			module.events = {
				// single declaration
				'dog woof' : function(){
					x += 10;
				},

				// multi declaration
				'dog' : {
					woof : function(){
						x += 10;
					}
				}
			};
			// process it
			module._processEventsSelector();

			module.dog = {};
			utils.copy( module.dog, eventsAggregator );
			module.bindEvents();

			// force the property to trigger an event
			module.dog.trigger('woof');

			expect(x).toBe(20);
		});

		it('Should be able to bind a map object to an event selector', function() {

			var multiple = 0,
				single = 0;

			var cars = module.cars = module.createMap('cars');
			cars.add('ford', {});

			module.events = {
				// single object binds to single event declaration
				'cars.ford crash' : function(){ single++; },

				// single object binds to multi event declarations
				'cars.ford' : {
					'crash' : function(){ single++; }
				},

				// multi objects binds to single event declaration
				'cars crash' : function(){ multiple++; },

				// multi objects bind to multi event declarations
				'cars' : {
					'crash' : function(){ multiple++; }
				}
			};
			module._processEventsSelector();

			module._bindMapObject( 'on', 'cars', 'ford', cars.get('ford') );
			cars.get('ford').trigger('crash');
			expect( single ).toBe( 2 );
			expect( multiple ).toBe( 2 );

			module._bindMapObject( 'off', 'cars', 'ford', cars.get('ford') );
			cars.get('ford').trigger('crash');
			expect( single ).toBe( 2 );
			expect( multiple ).toBe( 4 );

		});

		it('Should allow events to be propagated up', function(){

			var x = 0;
			var testModule = new Module({
				events : {
					'cars.ford test' : '-propagate',
					'view test' : '-propagate'
				}
			});
			testModule.on('test', function(){
				x+=10;
			});

			var cars = testModule.cars = testModule.createMap('cars');
			cars.add('ford', {});

			var view = {};
			utils.copy( view, eventsAggregator );
			testModule.view = view;
			testModule.bindEvents();

			expect( x ).toBe( 0 );

			testModule.view.trigger('test');
			expect( x ).toBe( 10 );

			testModule.cars.get('ford').trigger('test');
			expect( x ).toBe( 20 );
		});

		it('Should be able to unbind any event listeners on remove', function() {

			var multiple = 0,
				single = 0;

			// map add / remove
			module.events = {
				// single object binds to single event declaration
				'cars.ferrari crash' : function(){ single++; },

				// single object binds to multi event declarations
				'cars.ferrari' : {
					'crash' : function(){ single++; }
				},

				// multi objects binds to single event declaration
				'cars crash' : function(){ multiple++; },

				// multi objects bind to multi event declarations
				'cars' : {
					'crash' : function(){ multiple++; }
				}
			};
			module._processEventsSelector();

			var cars = module.cars = module.createMap('cars');

			cars.add({
				'proton' : {},
				'porsche' : {},
				'ferrari' : {},
				'bugatti' : {}
			});

			cars.each('trigger','crash');
			expect( single ).toBe( 2 );
			expect( multiple ).toBe( 8 );

			cars.remove('proton');

			cars.each('trigger','crash');
			expect( single ).toBe( 4 );
			expect( multiple ).toBe( 14 );

			cars.remove();
			cars.each('trigger','crash');
			expect( single ).toBe( 4 );
			expect( multiple ).toBe( 14 );

		});

	});

});