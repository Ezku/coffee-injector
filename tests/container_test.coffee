require 'should'
vows = require 'vows'
Container = require '../container'

vows
.describe('Using the coffee injector container')
.addBatch
	'given an empty container':
		topic: ->
			new Container
		
		'accessing a value should result in an exception': (c) ->
			try
				c.get('foo')
			catch e
				e.should.be.an.instanceof(Error)
				
		'should be able to set and get a value': (c) ->
			c.set('foo', 'bar').get('foo').should.equal 'bar'
		
		'should be able to describe a resource and retrieve it': (c) ->
			c.describe 'foo', -> 'bar'
			c.get('foo').should.equal 'bar'
		
		
				
	'given a container with a scalar value set':
		topic: ->
			c = new Container
			c.set 'foo', 'bar'
		
		'should be able to check whether a value is set': (c) ->
			c.has('foo').should.be.true
		
		'a descriptor should be able to access the value': (c) ->
			c.describe 'qux', -> @get 'foo'
			c.get('qux').should.equal('bar')
	
	'given a container with a resource description':
		topic: ->
			c = new Container
			c.describe 'foo', -> {}
		
		'the resource should be recreated every time it is accessed': (c) ->
			c.get('foo').should.not.equal c.get 'foo'

.export(module)