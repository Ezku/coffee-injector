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
				
	'given a container with a scalar value set':
		topic: ->
			c = new Container
			c.set 'foo', 'bar'
		
		'when accessing the value in a continuation': 
			topic: async (c, success, error) ->
				c.get('foo').then success, error
			
			'the value should be the first argument': (value) ->
				value.should.equal 'bar'

.export(module)