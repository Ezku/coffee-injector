(function() {
  var Container, all, defer, promise;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  defer = require('./node-promise/promise').defer;
  promise = function(f) {
    var deferred, result;
    deferred = defer();
    result = f(deferred.resolve, deferred.reject);
    return deferred.promise;
  };
  /*
  Given a list of promises, creates a promise that will be resolved or rejected
  when all the promises on the list have either been resolved or rejected. In
  case of mixed successes the result will be a rejection.
  */
  all = function(promises) {
    return promise(function(resolve, reject) {
      var next, p, rejected, resolved, _i, _len, _results;
      if (promises.length === 0) {
        resolve();
      }
      resolved = [];
      rejected = [];
      next = function() {
        if (resolved.length + rejected.length !== promises.length) {
          return;
        }
        if (rejected.length === 0) {
          return resolve(resolved);
        } else {
          return reject(rejected);
        }
      };
      _results = [];
      for (_i = 0, _len = promises.length; _i < _len; _i++) {
        p = promises[_i];
        _results.push(p.then(function(value) {
          resolved.push(value);
          return next();
        }, function(error) {
          rejected.push(error);
          return next();
        }));
      }
      return _results;
    });
  };
  /*
  TODO: Separate container into two parts: resource description and dependency
  resolution. This will allow for all kinds of helpers in the resource description
  part while keeping the dependency resolver clean.
  */
  module.exports = Container = (function() {
    Container.prototype.resources = null;
    Container.prototype.busy = null;
    function Container(resources, busy) {
      this.resources = resources != null ? resources : {};
      this.busy = busy != null ? busy : [];
    }
    Container.prototype.has = function(name) {
      return this.resources[name] != null;
    };
    Container.prototype.set = function(name, value) {
      return this.describe(name, function(result, error) {
        return result(value);
      });
    };
    Container.prototype.using = function(name) {
      if (__indexOf.call(this.busy, name) >= 0) {
        throw new Error("Recursive definition of resource '" + name + "' detected");
      }
      return new Container(this.resources, __slice.call(this.busy).concat([name]));
    };
    Container.prototype.get = function(name) {
      var name, promises, scope;
      if (arguments.length === 1) {
        if (this.resources[name] == null) {
          throw new Error("Resource '" + name + "' not available");
        }
        scope = this.using(name);
        return promise(__bind(function(resolve, reject) {
          return this.resources[name].call(scope, resolve, reject, scope);
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
