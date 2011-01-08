# Coffee-Injector in short

Coffee-Injector is a very small dependency injection container intended 
to fit both Javascript as a language and node.js as an environment where 
asynchronous execution is the rule rather than the exception. It is 
written in [CoffeeScript][cs] (a terrific language that compiles into 
Javascript), takes advantage of the [node-promise][np] library for 
asynchrony and is unit tested using [vows](http://vowsjs.org/). Read on 
for details.

[cs]: http://jashkenas.github.com/coffee-script/
[np]: http://github.com/kriszyp/node-promise

# Dependency injection the node.js way

Dependency injection is an often used mechanism for achieving inversion 
of control, a design principle related to the [D][d] in [SOLID][solid]. 
Dependency injection can be applied manually, but [a container 
object][iocc] specifically built for the occasion can make a 
programmer's life significantly easier. In statically typed languages, 
injection can often be automated to a large degree through such an 
approach with the alternative being meticulously handwritten resource 
initializations. In dynamic languages such as Javascript and Ruby, type 
information necessary for such automation is obviously going to be 
missing, but there are still ways for a container to perform valuable 
work for you. Why is it useful?

[d]: http://en.wikipedia.org/wiki/Dependency_inversion_principle
[solid]: http://en.wikipedia.org/wiki/SOLID
[iocc]: http://martinfowler.com/articles/injection.html

Dependency injection is, at its core, about how you wire different parts 
of your application together - about configuration. The sweet thing 
about this is the configured things don't really have to be just object 
graphs, but resources of any kind. Coffee-Injector borrows in ideology 
from a minimalistic style applied in [Ruby][ruby-di] and [PHP][php-di] 
that make use of closures for resource description. This, as opposed to 
automatic constructor and setter injection of objects, allows the 
container to remain agnostic of the kind of resources it stores. As 
Fabien Potencier puts it,

[ruby-di]: http://onestepback.org/index.cgi/Tech/Ruby/DependencyInjectionInRuby.rdoc
[php-di]: http://fabien.potencier.org/article/17/on-php-5-3-lambda-functions-and-closures

>   "Defining objects with lambda functions is great because *the developer can do whatever he wants*"

The essence of Coffee-Injector is to give you everything you need to set 
up your resources and resolve their dependencies, then get out of the 
way. You get a way to configure your application in one place. Because 
of the asynchronous nature of node.js, a sprinkle of Promises is added 
on top, but that is the extent of it. No bells and whistles.

# Features and usage

## Describing resources and using them

## Resource description helpers

## Cyclic dependency detection

# Installation and available cake tasks

Assuming you have node.js and npm installed:

	npm install coffee-script
	npm install vows
	git clone git@github.com:Ezku/coffee-injector.git

Once you're done, you can run the unit tests with `cake test` or just 
compile the coffeescript files with `cake compile`.

