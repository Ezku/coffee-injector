{defer, all} = require './node-promise/promise'

promise = (f) ->
	deferred = defer()
	f deferred.resolve, deferred.reject
	deferred.promise

module.exports = class Container
	resources: null
	
	constructor: ->
		@resources = {}
	
	has: (name) ->
		@resources[name]?
	
	set: (name, value) ->
		@describe name, (result, error) ->
			result value

	get: (name) ->
		if arguments.length is 1
			throw new Error("Resource '#{name}' not available") if not @resources[name]?
			promise (resolve, reject) =>
				@resources[name].call @, resolve, reject
		
		else
			promises = (@get name for name in arguments)
			all(promises)

	describe: (name, descriptor) ->
		@resources[name] = descriptor
		this