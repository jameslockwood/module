var ChatModule = Module.extend({

	initialize : function(){
		this.views = this.createMap('views');
	},

	start : function(){

		// create some views
		this.views.add( 'conversations', new Backbone.View({el : this.$('#convo-container')}) );
		this.views.add( 'pokes', new Backbone.View({el : this.$('#pokes-container')}) );
		this.views.add( 'notifications', new Backbone.View({el : this.$('#notify-container')}) );

		// trigger some events to test our event selector
		this.views.get( 'pokes' ).trigger('test', true, false );
		this.views.get( 'conversations' ).trigger('test', true, false, 'wahey' );

		// now let's add a arbitrary collection.  
		this.collection = new Backbone.Collection();

		// add to the collection to test.  this we won't be able to pick up this event as it's not a map object
		this.collection.add({})

		// so, set events to bind collection events to our event selectors
		// you don't need to do this if you're just using object maps (i.e. the views above)
		this.setEvents();

		// event will now get picked up.
		this.collection.add({})

	},

	stop: function(){
		this.views.remove();
		this.off();
	},

	// event selectors
	events : {
		'views.pokes test' : function( something, another ){
			console.log('Test event picked up.')
		},
		'views' : {
			'test' : function( view, viewName, something, another ){
				console.log( arguments )
			}
		},
		'collection add' : function(){
			console.log( arguments );
		}
	}

});