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
on top, but that is the extent of it. No bells and whistles. (Promises 
are one suggestion for a standard asynchronous interface suggested by 
and discussed at [CommonJS][cjs-promise]. Go check it out!)

[cjs-promise]: http://wiki.commonjs.org/wiki/Promises

# Features and usage

## Describing resources and using them

Using a dependency injection container should generally follow a pattern 
of [register-resolve-release][rrr], where you'll first configure the 
container, then retrieve root components and finally throw the container 
away. You'll be left with a small set of components with their 
dependencies fully resolved, meaning you're all set for launching your 
application. With the last, or the "release" step, being trivial, let's 
describe the first two in their basic forms with Coffee-Injector. We'll 
use accessing a local file as a simple example to include some 
asynchronous operations.

[rrr]: http://blog.ploeh.dk/2010/09/29/TheRegisterResolveReleasePattern.aspx

First, you'll need an instance of the container. This means requiring 
the container class and instantiating it.

	Container = require 'path/to/coffee-injector/container.js'
	c = new Container

There are two ways to register resources with the container. You can 
either set a fully resolved value - for things that are neither 
asynchronous nor dependent on other values - or provide a descriptor for 
resolving said value. The first kind is trivial.

	c.set 'filename', 'example.txt'
	if c.has 'filename'
		console.log "Successfully set a resource in the container!"

To access the value, use - you guessed it - `get`. The result of `get`, 
however, is not the resource as you'd expect, but a `Promise`. A 
`Promise` has a singular method, `then`, that accepts two arguments: the 
first one will be called if the promise was kept and resolved to a 
value, the second one in case there was an error and the promise was 
rejected. In this case, the promise will always immediately be resolved 
to a value.

	c.get('filename').then (filename) ->
		console.log filename

The other way is to provide a description of the process required to 
access the resource. This description will be reused every time the 
resource is accessed. There are two things to note: the description is 
just code in which you may do whatever you want, but the results need to 
be announced using callback functions provided by the container. Let's 
look at how you would read a file using plain node.js libraries and then 
transform it into a Coffee-Injector resource description.

	fs = require 'fs'
	fs.readFile 'example.txt', (err, data) ->
		throw err if err
		console.log data

A trivial conversion will look something like the following.

    c.describe 'example', (result, error) ->
		fs.readFile 'example.txt', (err, data) ->
			if err
				error err
			else
				result data

We provide the container with a callback function that takes two 
arguments, one for informing the container of a successful resource 
acquisition and one for reporting an erroneous result. Once our 
asynchronous callback function (that we passed to `readFile`) is 
invoked, we take corresponding action based on the callback's input. One 
thing you'll notice is that `example.txt` is explicitly contained in the 
definition. To get rid of the explicitness, we'll need to retrieve the 
value from the container itself. The descriptor function is ran in a 
scope that has access to accessor methods like `get`. So the full 
snippet, including using the resource, would look like this.
	
	fs = require 'fs'
	Container = require 'path/to/coffee-injector/container.js'
	
	c = new Container
	c.set 'filename', 'example.txt'
	c.describe 'example', (result, error) ->
		@get('filename').then (filename) ->
			fs.readFile filename, (err, data) ->
				if err
					error err
				else
					result data
	
	c.get('example').then (data) ->
		console.log data

The result we get is a decoupling of the wiring and the execution parts 
of the script.

<!-- TODO
## Resource description helpers
-->

## Cyclic dependency detection

A cyclic dependency means a situation where a resource depends on itself 
either directly (which is usually pretty easy to spot) or indirectly 
through another resource or several (debugging which can be tedious). 
Given the relative ease at which these situations can arise during 
development, their prevention is an important feature in dependency 
injection containers. Coffee-Injector obviously does this as well.

In some other languages, cyclic dependencies can be found through static 
analysis of the dependency graph, but the dynamic nature of Javascript 
limits us to detection during runtime. Therefore, the following code 
alone will not fail:

	c.describe 'foo', (result) ->
		@get('foo').then (value) ->
		    result value

Attempting to access `foo`, however, will generate an exception:

    try
        c.get('foo')
    catch e
        console.log 'whoops, found a cyclic dependency'

Coffee-Injector opts for a fail-fast approach, which means exceptions 
are favored for configuration errors over returning Promises that are 
resolved to errors.

# Installation and available cake tasks

Assuming you have node.js and npm installed:

	npm install coffee-script
	npm install vows
	git clone git@github.com:Ezku/coffee-injector.git

Once you're done, you can run the unit tests with `cake test` or just 
compile the coffeescript files with `cake compile`.

