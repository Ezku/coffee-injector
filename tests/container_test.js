(function() {
  var Assertion, Container, EventEmitter, expect, promising, promisingFailure, vows;

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

  promising = function(f) {
    return function() {
      var promise;
      promise = new EventEmitter;
      f.apply(null, arguments).then(function(value) {
        return promise.emit('success', value);
      }, function(error) {
        return promise.emit('error', error);
      });
      return promise;
    };
  };

  promisingFailure = function(f) {
    return function() {
      var promise;
      promise = new EventEmitter;
      f.apply(null, arguments).then(function(error) {
        return promise.emit('error', error);
      }, function(value) {
        return promise.emit('success', value);
      });
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
      /* TODO
      		
      		'when adding a helper':
      			topic: promising (c, success, failure) ->
      				c.helper 'trivial', (name, promise, descriptor) ->
      					
      		'when describing a resource as shared':
      			topic: promising (c, success, failure) ->
      				shared = {}
      				# The following as a method in a dynamically created class? Would allow for
      				c.helper 'shared', (name, promise, descriptor) -> 
      					if shared[name]?
      						shared[name]
      					else
      						descriptor().then (success) ->
      							shared[name] = 
      				
      				c.describe 'foo', -> @shared (result) ->
      					result {}
      				c.get('foo', 'foo').then success, failure
      		
      			'the resource should be the same for every access': (results) ->
      				[first, second] = results
      				first.should.equal second
      */
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
        topic: promising(function(c) {
          return c.get('foo');
        }),
        'should recieve a value in the success callback': expect('bar')
      },
      'when retrieving multiple values at a time': {
        topic: promising(function(c) {
          return c.get('foo', 'foo');
        }),
        'should recieve all selected values': function(values) {
          var first, second;
          first = values[0], second = values[1];
          return 'bar'.should.equal(first).and.equal(second);
        }
      },
      'when describing another resource that accesses the first resource': {
        topic: promising(function(c) {
          c.describe('qux', function(result) {
            return this.get('foo').then(function(foo) {
              return result(foo);
            });
          });
          return c.get('qux');
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
        topic: promisingFailure(function(c) {
          c.get('foo');
          return {
            'should recieve a value in the failure callback': expect('bar')
          };
        })
      },
      'when retrieving multiple values at a time': {
        topic: promisingFailure(function(c) {
          return c.get('foo', 'foo');
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
          topic: promisingFailure(function(c) {
            return c.get('foo', 'bar');
          }),
          'should recieve an error in the failure callback': function(errors) {
            return errors[0].should.equal('nay');
          }
        };
      }
    }
  })["export"](module);

}).call(this);
