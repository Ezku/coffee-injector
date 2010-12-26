(function() {
  var Container, EventEmitter, async, expect, vows;
  var __slice = Array.prototype.slice;
  require('should');
  vows = require('vows');
  Container = require('../container');
  EventEmitter = require('events').EventEmitter;
  async = function(f) {
    return function() {
      var promise;
      promise = new EventEmitter;
      f.apply(null, __slice.call(arguments).concat([function(value) {
        return promise.emit('success', value);
      }], [function(error) {
        return promise.emit('error', error);
      }]));
      return promise;
    };
  };
  expect = function(expectation) {
    return function(result) {
      return result.should.equal(expectation);
    };
  };
  vows.describe('Using the coffee injector container').addBatch({
    'given an empty container': {
      topic: function() {
        return new Container;
      },
      'has should return false': function(c) {
        return c.has('foo').should.be["false"];
      },
      'get should result in an exception': function(c) {
        try {
          c.get('foo');
          return true.should.be["false"];
        } catch (e) {
          return e.should.be.an["instanceof"](Error);
        }
      },
      'should be able to set a value': function(c) {
        c.set('foo', 'bar');
        return c.has('foo').should.be["true"];
      },
      'should be able to describe a resource': function(c) {
        c.describe('foo', function() {});
        return c.has('foo').should.be["true"];
      },
      'when describing a resource successfully': {
        topic: async(function(c, success, failure) {
          c.describe('foo', function(result) {
            return result('bar');
          });
          return c.get('foo').then(success, failure);
        }),
        'should recieve a value in the success callback': expect('bar')
      },
      'when describing a resource that fails': {
        topic: async(function(c, success, failure) {
          c.describe('foo', function(result, error) {
            return error('bar');
          });
          return c.get('foo').then(failure, success);
        }),
        'should recieve a value in the failure callback': expect('bar')
      }
    },
    'given a container with a scalar value set': {
      topic: function() {
        var c;
        c = new Container;
        return c.set('foo', 'bar');
      },
      'when passing a continuation': {
        topic: async(function(c, success, error) {
          return c.get('foo').then(success, error);
        }),
        'should recieve a value': expect('bar')
      }
    }
  })["export"](module);
}).call(this);
