##Module JS

ModuleJS is a lightweight library that provides high-level structure to complex web applications.  It aids the creation of apps that comprise of several disparate, self-contained modules.

It promotes apps to be built using a modular, declarative event-driven framework.  Each module has it's own DOM scope and is self-concerned while leaving it's lower-level implementation choices (such as an individual module's views, templates, models and collections) to the developer.

##Quick Start
TODO - Intro about module here.. what a module knows about, what it doesn't, what are it's responsibilities, what aren't its responsibilities. Event-driven architecture.

###Creating a `Module` Constructor
We create a Module constructor by extending the module constructor ('class'). We pass in an object literal containing properties and methods we wish to place on it's prototype.

```JavaScript
var MyModule = Module.extend({
   initialize : function(){ 
       console.log('hi');  // init function invoked upon object creation
   },
   start: function(){ ... },
   stop: function(){ ... },
   restart: function(){ ... },
   doSomething : function( ) { .. },
   someProperty : false
});
```

Each Module should have start,stop and restart methods to give us a strategy to install or uninstall. Additionally, if an initialize method is supplied, it will be invoked upon creation.


To make use of the constructor, simply
``` JavaScript
var module = new MyModule();
module.start()  // start up the module
```
We can also pass in a literal into the constructor to add properties / methods to the object instance. E.g. Below we are setting the scope of the Module instance below.
``` JavaScript
var module = new MyModule({
   scope : '.module-wrapper',
   someProperty : true
});
```

###Extending a `Module`
We can extend a Module so that behaviour and properties can be inherited.
``` JavaScript
var MyModule = Module.extend({
   initialize : function(){ ... },
   start: function(){ ... },
   stop: function(){ ... },
   restart: function(){ ... }
});
 
var AnotherModule = MyModule.extend({
   start: function(){
      // here we're overriding the start method.
   }
});
```