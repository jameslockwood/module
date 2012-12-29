var ChatModule = Module.extend({

	initialize : function(){
		this.views = this.createMap('views');
		this.models = this.createMap('models');
	},

	start : function(){
		// create some views
		this.views.add( {
			'conversations' : new Backbone.View({el : this.$('#convo-container')}),
			'pokes' : new Backbone.View({el : this.$('#pokes-container')}),
			'notifications' : new Backbone.View({el : this.$('#notify-container')})
		});
	},

	stop: function(){
		this.views.remove();
		this.off();
	},

	// event selectors
	events : {
		'views.pokes test' : function( something, another ){
			console.log('Test event picked up.');
		},
		'views.*' : {
			'test' : function( view, viewName, something, another ){
				console.log( arguments );
			}
		},
		'collection add' : function(){
			console.log( arguments );
		}
	}

});