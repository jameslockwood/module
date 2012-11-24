
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

	},

	stop: function(){
		this.trigger('stopped');
	},

	events : {
		'views.pokes click' : function( something, another ){
		},
		'views' : {
			'click' : function( view, viewName, something, another ){
				// console.log( arguments )
			},
			'another' : function( b ){
			}
		}
	}

});