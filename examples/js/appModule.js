var App = Module.extend({

	initialize: function() {
		this.modules = this.createMap('modules');
	},

	start: function() {
		this.modules.add('chat', new ChatModule());
		this.modules.each('start');
	},

	stop: function() {
		this.modules.each('stop');
		this.models.remove();
	}

});