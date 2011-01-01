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
      }
    },
    'given a succeeding resource description': {
      topic: function() {
        var c;
        c = new Container;
        return c.describe('foo', function(result) {
          return result('bar');
        });
      },
      'when attempting retrieval': {
        topic: async(function(c, success, failure) {
          return c.get('foo').then(success, failure);
        }),
        'should recieve a value in the success callback': expect('bar')
      },
      'when retrieving multiple values at a time': {
        topic: async(function(c, success, failure) {
          return c.get('foo', 'foo').then(success, failure);
        }),
        'should recieve all selected values': function(values) {
          var first, second;
          first = values[0], second = values[1];
          return 'bar'.should.equal(first).and.equal(second);
        }
      }
    },
    'given a failing resource description': {
      topic: function() {
        var c;
        c = new Container;
        return c.describe('foo', function(result, error) {
          return error('bar');
        });
      },
      'when attempting retrieval': {
        topic: async(function(c, success, failure) {
          c.get('foo').then(failure, success);
          return {
            'should recieve a value in the failure callback': expect('bar')
          };
        })
      },
      'when retrieving multiple values at a time': {
        topic: async(function(c, success, failure) {
          return c.get('foo', 'foo').then(failure, success);
        }),
        'should recieve all errors in the failure callback': function(errors) {
          var first, second;
          first = errors[0], second = errors[1];
          return 'bar'.should.equal(first).and.equal(second);
        }
      }
    },
    'given a succeeding and a failing resource description': {
      topic: function() {
        var c;
        c = new Container;
        c.describe('foo', function(result) {
          return result('yay');
        });
        return c.describe('bar', function(result, error) {
          return error('nay');
        });
      },
      'when retrieving both values': function() {
        return {
          topic: async(function(c, success, failure) {
            return c.get('foo', 'bar').then(failure, success);
          }),
          'should recieve an error in the failure callback': function(errors) {
            return errors[0].should.equal('nay');
          }
        };
      }
    }
  })["export"](module);
}).call(this);
