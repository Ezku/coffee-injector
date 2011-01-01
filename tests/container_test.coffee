require 'should'
vows = require 'vows'
Container = require '../container'
{EventEmitter} = require 'events'

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
			try
				c.get('foo')
				true.should.be.false
			catch e
				e.should.be.an.instanceof Error
		
		'should be able to set a value': (c) ->
			c.set 'foo', 'bar'
			c.has('foo').should.be.true
		
		'should be able to describe a resource': (c) ->
			c.describe 'foo', ->
			c.has('foo').should.be.true
	
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

			'should recieve all errors': (values) ->
				[first, second] = values
				'bar'.should.equal(first).and.equal(second)
			
.export(module)