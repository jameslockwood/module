##Module JS

A lightweight library for creating large-scale modular JavaScript applications

##Quick Start
TODO - Intro about module here.. what a module knows about, what it doesn't, what are it's responsibilities, what aren't its responsibilities. Event-driven architecture.

###Creating
We create a Module constructor by extending the module constructor ('class'). We pass in an object literal containing properties and methods we wish to place on it's prototype. This syntax is very similar to Backbone's.

```JavaScript
BaseModule = Module.extend({
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
var myModule = new BaseModule();
```
We can also pass in a literal into the constructor to add properties / methods to the object instance. E.g. Below we are setting the scope of the Module instance below.
``` JavaScript
var myModule = new BaseModule({
  scope : '.module-wrapper'
});
```

###Extending
Just like with Backbone, we can extend a Module so that behaviour and properties can be inherited.
``` JavaScript
BaseModule = Module.extend({
   initialize : function(){ ... },
   start: function(){ ... },
   stop: function(){ ... },
   restart: function(){ ... }
});
 
AnotherModule = BaseModule.extend({
   start: function(){
      // here we're overriding the start method.
   }
});
```