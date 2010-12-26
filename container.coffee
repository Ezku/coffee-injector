{defer} = require './node-promise/promise'

module.exports = class Container
	resources: null
	
	constructor: ->
		@resources = {}
	
	has: (name) ->
		@resources[name]?
	
	set: (name, value) ->
		@describe name, (success, failure) -> success value

	get: (name) ->
		throw new Error("Resource '#{name}' not available") if not @resources[name]?
		deferred = defer()
		@resources[name].call @, deferred.resolve, deferred.resolve
		deferred.promise

	describe: (name, descriptor) ->
		@resources[name] = descriptor
		this