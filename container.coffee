{defer} = require 'node-promise'

promise = (f) ->
	deferred = defer()
	result = f deferred.resolve, deferred.reject
	deferred.promise

###
Given a list of promises, creates a promise that will be resolved or rejected
when all the promises on the list have either been resolved or rejected. In
case of mixed successes the result will be a rejection.
###
all = (promises) -> promise (resolve, reject) ->
	resolve() if promises.length is 0
	resolved = []
	rejected = []
	
	next = ->
		return unless resolved.length + rejected.length == promises.length
		if rejected.length is 0
			resolve resolved
		else
			reject rejected
	
	for p in promises
		p.then (value) ->
				resolved.push value
				do next
			, (error) ->
				rejected.push error
				do next

multimethod = (single, multiple) -> ->
	if arguments.length is 1
		single.apply this, arguments
	else
		multiple.call this, arguments

class Resolver
	resources: null
	busy: null
	
	constructor: (@resources = {}, @busy = []) ->
	
	has: multimethod(
		(name) ->
			@resources[name]?
		(names) ->
			return true for name in names when @has name
			return false
	)
	
	get: multimethod(
		(name) ->
			unless @has name
				throw new Error("Resource '#{name}' not available")
			scope = @using name
			promise (resolve, reject) =>
				@resources[name].call scope, resolve, reject, scope
		(names) ->
			promises = (@get name for name in names)
			all promises
	)
	
	using: (name) ->
		if name in @busy
			throw new Error("Recursive definition of resource '#{name}' detected")
		new Resolver @resources, [@busy..., name]

module.exports = class Container
	resources: null
	
	constructor: (@resources = {}) ->

	resolver: -> new Resolver(@resources)

	describe: (name, descriptor) ->
		@resources[name] = descriptor
		this

	set: (name, value) ->
		@describe name, (result, error) ->
			result value
	
	has: (name) ->
		@resources[name]?
	
	get: ->
		@resolver().get arguments...
