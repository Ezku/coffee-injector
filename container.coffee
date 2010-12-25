module.exports = class Container
	resources: null
	
	constructor: ->
		@resources = {}
	
	has: (name) ->
		@resources[name]?
	
	set: (name, value) ->
		@describe name, -> value

	get: (name) ->
		throw new Error("Resource '#{name}' not available") if not @resources[name]?
		@resources[name].call @

	describe: (name, descriptor) ->
		@resources[name] = descriptor
		this