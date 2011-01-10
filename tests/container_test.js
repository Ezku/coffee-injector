(function() {
  var Assertion, Container, EventEmitter, async, expect, vows;
  var __slice = Array.prototype.slice;
  vows = require('vows');
  Container = require('../container');
  Assertion = require('should').Assertion;
  EventEmitter = require('events').EventEmitter;
  Assertion.prototype["throw"] = Assertion.prototype.thrown = function(f) {
    try {
      f();
      this.assert(false, 'expected an exception to be thrown');
    } catch (e) {
      e.should.be.an["instanceof"](this.obj);
    }
    return this;
  };
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
        return Error.should.be.thrown(function() {
          return c.get('foo');
        });
      },
      'should be able to set a value': function(c) {
        c.set('foo', 'bar');
        return c.has('foo').should.be["true"];
      },
      'should be able to describe a resource': function(c) {
        c.describe('foo', function() {});
        return c.has('foo').should.be["true"];
      },
      'should be able to access has in a resource description': function(c) {
        c.describe('foo', function() {
          return this.has('foo').should.be["true"];
        });
        return c.get('foo');
      },
      'getting the resource under description should lead to an exception': function(c) {
        try {
          c.describe('foo', function() {
            return this.get('foo');
          });
          return c.get('foo');
        } catch (e) {
          e.should.not.be.an["instanceof"](RangeError);
          return e.should.be.an["instanceof"](Error);
        }
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
      },
      'when describing another resource that accesses the first resource': {
        topic: async(function(c, success, failure) {
          c.describe('qux', function(result) {
            return this.get('foo').then(function(foo) {
              console.log('lol');
              return result(foo);
            });
          });
          return c.get('qux').then(success, failure);
        }),
        'should be able to successfully retrieve the value': expect('bar')
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
