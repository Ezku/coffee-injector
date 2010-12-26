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

expect = (expectation) ->
	(result) -> result.should.equal expectation

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
				e.should.be.an.instanceof(Error)
		
		'should be able to set a value': (c) ->
			c.set 'foo', 'bar'
			c.has('foo').should.be.true
		
		'should be able to describe a resource': (c) ->
			c.describe 'foo', ->
			c.has('foo').should.be.true
		
		'when describing a resource successfully':
			topic: async (c, success, failure) ->
				c.describe 'foo', (result) -> result 'bar'
				c.get('foo').then success, failure
			
			'should recieve a value in the success callback': expect 'bar'
	
		'when describing a resource that fails':
			topic: async (c, success, failure) ->
				c.describe 'foo', (result, error) -> error 'bar'
				c.get('foo').then failure, success
			
			'should recieve a value in the failure callback': expect 'bar'
				
	'given a container with a scalar value set':
		topic: ->
			c = new Container
			c.set 'foo', 'bar'
		
		'when passing a continuation': 
			topic: async (c, success, error) ->
				c.get('foo').then success, error
			
			'should recieve a value': expect 'bar'
			

.export(module)