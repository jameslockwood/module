var App = Module.extend({

	initialize : function(){
		this.modules = this.createMap('modules');
		this.modules.add('chat', new ChatModule());
	},

	start : function(){
		this.modules.each('start');
		this.modules.each('stop');
	}

});