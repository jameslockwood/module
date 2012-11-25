##Module JS

ModuleJS is a lightweight library that provides high-level structure to complex web applications, encouraging the creation of apps that comprise of several disparate, self-contained modules.

It allows apps to be easily built using a modular, declarative event-driven architecture.  Each module has it's own DOM scope and is self-concerned, allowing lower-level implementation choices (such as an individual module's usage of views, models etc.) to be decided by the developer.

##Quick Start
TODO - Intro about module here.. what a module knows about, what it doesn't, what are it's responsibilities, what aren't its responsibilities. Event-driven architecture.

###Creating a `Module` Constructor
We create a Module by extending the module constructor. We pass in an object literal containing properties and methods we wish to place on it's prototype.

In the example below we'll create a simple module that represents an email-client application that consists of: 
- A chat sub-module
- An email sub-module
- A notifications sub-module

Within the module, we'll add all of our above sub modules.  Using the event selectors in the `events` property the added sub-modiles are then automatically wired together, mediator style.  Finally, we'll then start all of the sub-modules.

```JavaScript
var App = Module.extend({

   // Initialize is called when an instance of App is instantiated
   initialize: function(){ 
      // create a mapping to store sub-modules that comprise this app
      this.modules = this.createMap('modules');
   },

   // strategy to start the app
   start: function(){
      // add the sub-modules that make up the application, passing in their DOM scope
      this.modules.add('chat', new ChatModule({ scope: this.$('#chat') }));
      this.modules.add('email', new EmailModule({ scope: this.$('#email') }));
      this.modules.add('notifications', new NotifyModule({ scope: this.$('#notifications') }));

      // start all of our sub-modules
      this.modules.each('start');
   },

   // strategy to stop the app
   stop: function(){
      // remove all of our sub-modules
      this.modules.remove();
   },

   // strategy to restart the app
   restart: function(){
      this.stop();
      this.start();
   },

   // declare on events that our sub-modules will emit using event selectors:
   events: {
      // on errors of *any* of our sub-modules
      'modules error': function( moduleName, module, errorMessage ){
         this.log('Module ' + moduleName + ' failed - ' + errorMessage);
      },

      // on new message from chat sub-module
      'modules.chat newMessage': function( message ){
         this.modules.get('notifications').newAlert('chat', message);
      },

      // on new message from email sub-module
      'modules.email newMessage': function( message ){
         this.modules.get('notifications').newAlert('email', message)
      },

      // an alternative way of hooking up the above events - here we're setting multiple on events for *all* sub modules
      modules: {
         error : function( moduleName, module, errorMessage ){
            this.log('Module ' + moduleName + ' failed - ' + errorMessage);
         },
         newMessage : function( moduleName, module, message ){
            this.modules.get('notifications').newAlert( moduleName, message );
         }
      }
   }
});
```

Each Module should have start,stop and restart methods to give us a strategy to install or uninstall. Additionally, if an initialize method is supplied, it will be invoked upon creation.


To make use of the constructor, simply
``` JavaScript
var app = new App({
   scope : '#email-client'  // pass in the applications DOM scope
});
app.start()  // start up the module
```
We can also pass in a literal into the constructor to add properties / methods to the object instance. E.g. Just like above where we are setting the scope of the Module.

