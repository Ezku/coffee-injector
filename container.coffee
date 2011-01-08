{defer} = require './node-promise/promise'

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

###
TODO: Separate container into two parts: resource description and dependency
resolution. This will allow for all kinds of helpers in the resource description
part while keeping the dependency resolver clean.
###
module.exports = class Container
	resources: null
	busy: null
	
	constructor: (@resources = {}, @busy = []) ->
	
	has: (name) ->
		@resources[name]?
	
	set: (name, value) ->
		@describe name, (result, error) ->
			result value
	
	using: (name) ->
		if name in @busy
			throw new Error("Recursive definition of resource '#{name}' detected")
		new Container @resources, [@busy..., name]

	get: (name) ->
		if arguments.length is 1
			unless @resources[name]?
				throw new Error("Resource '#{name}' not available")
			scope = @using name
			promise (resolve, reject) =>
				@resources[name].call scope, resolve, reject, scope
		
		else
			promises = (@get name for name in arguments)
			all promises

	describe: (name, descriptor) ->
		@resources[name] = descriptor
		this