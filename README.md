##Module JS

Module.js enables you to build large-scale JavaScript applications that are composed of several decoupled, testable and reusable modules.

It promotes apps to be built using a modular, event-driven architecture. Each module is aggressively self-concerned, having it's own DOM scope, it's own lifecycle management, and it's own messaging/events mechanism.

The full documentation and tutorials can be found at http://jameslockwood.github.com/module/

##Quick Start
TODO - Intro about module here.. what a module knows about, what it doesn't, what are it's responsibilities, what aren't its responsibilities. Event-driven architecture.

###Creating a `Module` Constructor
We create a Module by extending the module constructor. We pass in an object literal containing properties and methods we wish to place on it's prototype.

In the example below we'll create a simple module that represents an email-client application that consists of: 
- A chat sub-module
- An email sub-module
- A notifications sub-module

Within the module, we'll add all of our above sub modules.  Using the event selectors in the `events` property the added sub-modules are then automatically wired together, mediator style.  Finally, we'll then start all of the sub-modules.

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

   // declare 'on' events that our sub-modules will emit using event selectors
   events: {
      // multiple 'on' events applying to *all* sub-modules
      'modules.*': {
         // when one of the sub-modules produces an error
         'error' : function( moduleName, module, error, errorMessage ){
            this.log('Module ' + moduleName + ' failed - ' + errorMessage);
         },
         // when one of the sub-modules receives a new message
         'newMessage' : function( moduleName, module, message ){
            this.modules.get('notifications').newAlert( moduleName, message );
         }
      },

      // when our email sub-module has sent an email
      'modules.email sent': function( details ){
         this.modules.get('notifications').newConfirmation( details );
      },

      // when our chat sub-module receives a friend request
      'modules.chat friendRequest': function( details ){
         this.modules.get('notifications').newAlert( 'friendRequest', details );
      }
   }
});
```
