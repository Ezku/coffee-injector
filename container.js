(function() {
  var Container, Resolver, all, defer, multimethod, promise,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = Array.prototype.slice;

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
      if (promises.length === 0) resolve();
      resolved = [];
      rejected = [];
      next = function() {
        if (resolved.length + rejected.length !== promises.length) return;
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

  multimethod = function(single, multiple) {
    return function() {
      if (arguments.length === 1) {
        return single.apply(this, arguments);
      } else {
        return multiple.call(this, arguments);
        /*
        		TODO: Separate container into two parts: resource description and dependency
        		resolution. This will allow for all kinds of helpers in the resource description
        		part while keeping the dependency resolver clean.
        
        		Resolver:
        		- has
        		- get
        		Descriptor:
        		- set
        		- describe
        */
      }
    };
  };

  Resolver = (function() {

    Resolver.prototype.resources = null;

    Resolver.prototype.busy = null;

    function Resolver(resources, busy) {
      this.resources = resources != null ? resources : {};
      this.busy = busy != null ? busy : [];
    }

    Resolver.prototype.has = multimethod(function(name) {
      return this.resources[name] != null;
    }, function(names) {
      var name, _i, _len;
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        if (this.has(name)) return true;
      }
      return false;
    });

    Resolver.prototype.get = multimethod(function(name) {
      var scope,
        _this = this;
      if (!this.has(name)) {
        throw new Error("Resource '" + name + "' not available");
      }
      scope = this.using(name);
      return promise(function(resolve, reject) {
        return _this.resources[name].call(scope, resolve, reject, scope);
      });
    }, function(names) {
      var name, promises;
      promises = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = names.length; _i < _len; _i++) {
          name = names[_i];
          _results.push(this.get(name));
        }
        return _results;
      }).call(this);
      return all(promises);
    });

    Resolver.prototype.using = function(name) {
      if (__indexOf.call(this.busy, name) >= 0) {
        throw new Error("Recursive definition of resource '" + name + "' detected");
      }
      return new Resolver(this.resources, __slice.call(this.busy).concat([name]));
    };

    return Resolver;

  })();

  module.exports = Container = (function() {

    Container.prototype.resources = null;

    function Container(resources) {
      this.resources = resources != null ? resources : {};
    }

    Container.prototype.resolver = function() {
      return new Resolver(this.resources);
    };

    Container.prototype.describe = function(name, descriptor) {
      this.resources[name] = descriptor;
      return this;
    };

    Container.prototype.set = function(name, value) {
      return this.describe(name, function(result, error) {
        return result(value);
      });
    };

    Container.prototype.has = function(name) {
      return this.resources[name] != null;
    };

    Container.prototype.get = function() {
      var _ref;
      return (_ref = this.resolver()).get.apply(_ref, arguments);
    };

    return Container;

  })();

}).call(this);
