{defer} = require './node-promise/promise'

promise = (f) ->
	deferred = defer()
	f deferred.resolve, deferred.reject
	deferred.promise

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