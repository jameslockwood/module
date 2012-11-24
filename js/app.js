
var App = Module.extend({

	initialize : function(){
		this.modules = this.createMap('modules');
		this.modules.add('chat', new ChatModule());
	},

	start : function(){
		this.modules.each('start');
	}

});


var ChatModule = Module.extend({

	initialize : function(){
		this.views = this.createMap('views');
	},

	start : function(){

		this.views.add('conversations', {});
		this.views.add('pokes', {});
		this.views.add('lockwoods', {});
		this.views.get('pokes').trigger('click', true, false );
		this.views.get('conversations').trigger('click', true, false, 'wahey' );

		this.collection = new Backbone.Collection();

		this.setEvents();

		this.collection.add({})

	},

	stop: function(){
		this.trigger('stopped');
	},

	events : {
		'views.pokes click' : function( something, another ){
			console.log('boom.')
		},
		'views' : {
			'click' : function( view, viewName, something, another ){
				console.log( arguments )
			},
			'another' : function( b ){
			}
		},
		'collection add' : function(){
			console.log( arguments );
		}
	}

});