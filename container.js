(function() {
  var Container, all, defer, promise, _ref;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ref = require('./node-promise/promise'), defer = _ref.defer, all = _ref.all;
  promise = function(f) {
    var deferred;
    deferred = defer();
    f(deferred.resolve, deferred.reject);
    return deferred.promise;
  };
  module.exports = Container = (function() {
    Container.prototype.resources = null;
    function Container() {
      this.resources = {};
    }
    Container.prototype.has = function(name) {
      return this.resources[name] != null;
    };
    Container.prototype.set = function(name, value) {
      return this.describe(name, function(result, error) {
        return result(value);
      });
    };
    Container.prototype.get = function(name) {
      var name, promises;
      if (arguments.length === 1) {
        if (!(this.resources[name] != null)) {
          throw new Error("Resource '" + name + "' not available");
        }
        return promise(__bind(function(resolve, reject) {
          return this.resources[name].call(this, resolve, reject);
        }, this));
      } else {
        promises = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = arguments.length; _i < _len; _i++) {
            name = arguments[_i];
            _results.push(this.get(name));
          }
          return _results;
        }).apply(this, arguments);
        return all(promises);
      }
    };
    Container.prototype.describe = function(name, descriptor) {
      this.resources[name] = descriptor;
      return this;
    };
    return Container;
  })();
}).call(this);
