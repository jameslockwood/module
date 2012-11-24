
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
		this.views.add('conversations', {});
		this.views.add('pokes', {});
	},

	start : function(){
		this.trigger('started');
		this.views.each( function( view, viewName ){
		
		});
		this.views.get('pokes');
		this.views.remove('pokes');
	},

	stop: function(){
		this.trigger('stopped');
	}

});