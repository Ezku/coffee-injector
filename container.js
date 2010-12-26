(function() {
  var Container, defer;
  defer = require('./node-promise/promise').defer;
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
      var deferred;
      if (!(this.resources[name] != null)) {
        throw new Error("Resource '" + name + "' not available");
      }
      deferred = defer();
      this.resources[name].call(this, deferred.resolve, deferred.reject);
      return deferred.promise;
    };
    Container.prototype.describe = function(name, descriptor) {
      this.resources[name] = descriptor;
      return this;
    };
    return Container;
  })();
}).call(this);
