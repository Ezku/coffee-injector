vows = require 'vows'
Container = require '../container'
{Assertion} = require 'should'
{EventEmitter} = require 'events'

Assertion::throw = Assertion::thrown = (f) ->
	try
		do f
		@assert false, 'expected an exception to be thrown'
	catch e
		e.should.be.an.instanceof @obj
	@

async = (f) -> ->
	promise = new EventEmitter
	f arguments...,
		(value) -> promise.emit 'success', value
		(error) -> promise.emit 'error', error
	promise

expect = (expectation) -> (result) ->
	result.should.equal expectation

vows
.describe('Using the coffee injector container')
.addBatch
	'given an empty container':
		topic: ->
			new Container
		
		'has should return false': (c) ->
			c.has('foo').should.be.false
		
		'get should result in an exception': (c) ->
			Error.should.be.thrown -> c.get 'foo'
		
		'should be able to set a value': (c) ->
			c.set 'foo', 'bar'
			c.has('foo').should.be.true
		
		'should be able to describe a resource': (c) ->
			c.describe 'foo', ->
			c.has('foo').should.be.true
		
		'should be able to access has in a resource description': (c) ->
			c.describe 'foo', ->
				@has('foo').should.be.true
			c.get 'foo'
		
		'getting the resource under description should lead to an exception': (c) ->
			try
				c.describe 'foo', ->
					@get 'foo'
				c.get 'foo'
			catch e
				e.should.not.be.an.instanceof RangeError
				e.should.be.an.instanceof Error
		
		### TODO
		'when describing a resource as shared':
			topic: async (c, success, failure) ->
				c.describe 'foo', (result) -> @shared -> result {}
				c.get('foo', 'foo').then success, failure
		
			'the resource should be the same for every access': (results) ->
				[first, second] = results
				first.should.equal second
		###
	'given a succeeding resource description':
		topic: ->
			c = new Container
			c.describe 'foo', (result) -> result 'bar'
		
		'when attempting retrieval':
			topic: async (c, success, failure) ->
				c.get('foo').then success, failure
				
			'should recieve a value in the success callback': expect 'bar'
		
		'when retrieving multiple values at a time':
			topic: async (c, success, failure) ->
				c.get('foo', 'foo').then success, failure
			
			'should recieve all selected values': (values) ->
				[first, second] = values
				'bar'.should.equal(first).and.equal(second)
		
		'when describing another resource that accesses the first resource':
			topic: async (c, success, failure) ->
				c.describe 'qux', (result) ->
					@get('foo').then (foo) ->
						result foo
				c.get('qux').then success, failure
			
			'should be able to successfully retrieve the value': expect 'bar'
				
		
	'given a failing resource description':
		topic: ->
			c = new Container
			c.describe 'foo', (result, error) -> error 'bar'
		
		'when attempting retrieval':
			topic: async (c, success, failure) ->
				c.get('foo').then failure, success
		
				'should recieve a value in the failure callback': expect 'bar'
		
		'when retrieving multiple values at a time':
			topic: async (c, success, failure) ->
				c.get('foo', 'foo').then failure, success

			'should recieve all errors in the failure callback': (errors) ->
				[first, second] = errors
				'bar'.should.equal(first).and.equal(second)
	
	'given a succeeding and a failing resource description':
		topic: ->
			c = new Container
			c.describe 'foo', (result) -> result 'yay'
			c.describe 'bar', (result, error) -> error 'nay'
		
		'when retrieving both values': ->
			topic: async (c, success, failure) ->
				c.get('foo', 'bar').then failure, success
			
			'should recieve an error in the failure callback': (errors) ->
				errors[0].should.equal 'nay'
	
.export(module)