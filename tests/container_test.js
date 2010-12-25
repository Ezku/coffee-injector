(function() {
  var Container, vows;
  require('should');
  vows = require('vows');
  Container = require('../container');
  vows.describe('Using the coffee injector container').addBatch({
    'given an empty container': {
      topic: function() {
        return new Container;
      },
      'accessing a value should result in an exception': function(c) {
        try {
          return c.get('foo');
        } catch (e) {
          return e.should.be.an["instanceof"](Error);
        }
      },
      'should be able to set and get a value': function(c) {
        return c.set('foo', 'bar').get('foo').should.equal('bar');
      },
      'should be able to describe a resource and retrieve it': function(c) {
        c.describe('foo', function() {
          return 'bar';
        });
        return c.get('foo').should.equal('bar');
      }
    },
    'given a container with a scalar value set': {
      topic: function() {
        var c;
        c = new Container;
        return c.set('foo', 'bar');
      },
      'should be able to check whether a value is set': function(c) {
        return c.has('foo').should.be["true"];
      },
      'a descriptor should be able to access the value': function(c) {
        c.describe('qux', function() {
          return this.get('foo');
        });
        return c.get('qux').should.equal('bar');
      }
    },
    'given a container with a resource description': {
      topic: function() {
        var c;
        c = new Container;
        return c.describe('foo', function() {
          return {};
        });
      },
      'the resource should be recreated every time it is accessed': function(c) {
        return c.get('foo').should.not.equal(c.get('foo'));
      }
    }
  })["export"](module);
}).call(this);
