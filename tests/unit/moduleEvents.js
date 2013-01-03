describe("Module", function() {

	describe("Events", function() {

		var module;

		beforeEach(function() {
			module = new Module();
		});

		describe("RegisterEventHandler", function() {

			it('Should register an event handler', function() {
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

		});

		describe("GetEventHandlers", function() {

			it('Should retrieve an event handler', function() {
				// get event handler
				module._registerEventHandler( 'subModules','error', function(){} );
				module._registerEventHandler( 'subModules','error', function(){} );
				module._registerEventHandler( 'subModules','error', function(){} );

				var handler = module._getEventHandlers( 'subModules', 'error' );

				expect( typeof handler ).toBe('object');
				expect( handler.length ).toBe( 3 );
				expect( typeof handler[0] ).toBe( 'function' );
			});

		});

		describe("EventsPropertyBlacklist", function() {

			it('Should identify properties that should be blacklisted from event handlers', function() {
				// setup events blacklist
				var testModule = new Module({
					a : {},
					b : {}
				});

				var blacklist = testModule._.eventsBlacklist;

				expect( blacklist.a ).toBeDefined();
				expect( blacklist.b ).toBeDefined();
			});

		});
	
		describe('Event Selector Processing', function(){

			it('Should process an event selector', function() {

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

			it('Should process an event selector with star declarations', function() {

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

			it('Should process a global star event selector', function() {

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
				Module.installEventsTo( module.dog );
				module.bindEvents();

				// force the property to emit an event
				module.dog.emit('woof');

				expect(x).toBe(30);

			});

		});

		describe('events aggregation', function(){

			it('Should be assigned an events aggregator', function() {
				var x = 0;
				// test that they exist as functions
				expect( typeof module.on ).toBe( 'function' );
				expect( typeof module.off ).toBe( 'function' );
				expect( typeof module.emit ).toBe( 'function' );

				// now see if they work
				module.on('test', function(){
					x = 5;
				});

				module.emit('test');
				expect(x).toBe(5);

				// turn off all events
				module.off('test');
				module.emit('test');
				expect(x).toBe(5);
			});


		});
	
		describe('bindProperty', function(){
			it('Should bind a property to an event', function() {
				var x = 0;
				var singleTestResult = '';
				var multiTestResult = '';

				// create our events selector
				module.events = {
					// single declaration
					'dog woof' : function( test ){
						x += 10;
						singleTestResult = test;
					},

					// multi declaration
					'dog' : {
						woof : function( test ){
							x += 10;
							multiTestResult = test;
						}
					}
				};
				// process it
				module._processEventsSelector();

				// now create our property with its own events aggregator that we wish to bind to
				module.dog = {};
				Module.installEventsTo( module.dog );

				// now bind the property with any declarations in our events selector
				module._bindProperty( 'on', 'dog', module.dog );

				// do multiple on/off to make sure we're unbinding properly
				module._bindProperty( 'off', 'dog', module.dog );
				module._bindProperty( 'on', 'dog', module.dog );

				// force the property to emit an event
				module.dog.emit('woof', 'bobby');

				expect(x).toBe(20);
				expect(singleTestResult).toBe('bobby');
				expect(multiTestResult).toBe('bobby');

			});
		});

		describe('bindEvents', function(){
			it('Should bind normal object properties to an event selector', function() {
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
				Module.installEventsTo( module.dog );
				module.bindEvents();

				// force the property to emit an event
				module.dog.emit('woof');

				expect(x).toBe(20);
			});
		});

		describe('bindMapObject', function(){

			it('Should bind and unbind a map object to an event selector', function() {

				var multiple = 0,
					single = 0;

				module.events = {
					// single object binds to single event declaration
					'vehicles.ford crash' : function(){ single++; },

					// single object binds to multi event declarations
					'vehicles.ford' : {
						'crash' : function(){ single++; }
					},

					// multi objects binds to single event declaration
					'vehicles crash' : function(){ multiple++; },

					// multi objects bind to multi event declarations
					'vehicles' : {
						'crash' : function(){ multiple++; }
					}
				};
				module._processEventsSelector();

				var ford = {};
				Module.installEventsTo( ford );

				// bind the object then emit a crash event. Test values should change.
				module._bindMapObject('on', 'vehicles', 'ford', ford);
				ford.emit('crash');
				expect( single ).toBe( 2 );
				expect( multiple ).toBe( 2 );

				// unbind the crash event then emit again.  Test values should not change.
				module._bindMapObject('off', 'vehicles', 'ford', ford);
				ford.emit('crash');
				expect( single ).toBe( 2 );
				expect( multiple ).toBe( 2 );

			});
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

			// add a map that should bind automatically with events
			var cars = testModule.cars = testModule.createMap('cars');
			cars.add('ford', {});

			// add an object literal that we need to manually bind via bindEvents
			var view = {};
			Module.installEventsTo( view );
			testModule.view = view;
			testModule.bindEvents();

			// start the tests
			expect( x ).toBe( 0 );

			// test that object literal can propagate events up
			testModule.view.emit('test');
			expect( x ).toBe( 10 );

			// test that our map can propagate events up
			testModule.cars.get('ford').emit('test');
			expect( x ).toBe( 20 );
		});

		it('Should unbind all event listeners on map array remove', function() {

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

			cars.each('emit','crash');
			expect( single ).toBe( 2 );
			expect( multiple ).toBe( 8 );

			cars.remove('proton');

			cars.each('emit','crash');
			expect( single ).toBe( 4 );
			expect( multiple ).toBe( 14 );

			cars.remove();
			cars.each('emit','crash');
			expect( single ).toBe( 4 );
			expect( multiple ).toBe( 14 );

		});


		it('Should bind to multiple objects within a map array', function() {

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

			// add three objects within the 'ferrari' map array
			cars.add('ferrari',{});
			cars.add('ferrari',{});
			cars.add('ferrari',{});

			// each object within the ferrari map array should emit
			cars.each('emit','crash');
			expect( single ).toBe( 6 );
			expect( multiple ).toBe( 6 );

			cars.remove('ferrari');

			cars.each('emit','crash');
			expect( single ).toBe( 6 );
			expect( multiple ).toBe( 6 );

			cars.remove();
			cars.each('emit','crash');
			expect( single ).toBe( 6 );
			expect( multiple ).toBe( 6 );

		});

	});

});