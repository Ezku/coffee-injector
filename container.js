(function() {
  var Container;
  module.exports = Container = (function() {
    Container.prototype.resources = null;
    function Container() {
      this.resources = {};
    }
    Container.prototype.has = function(name) {
      return this.resources[name] != null;
    };
    Container.prototype.set = function(name, value) {
      return this.describe(name, function() {
        return value;
      });
    };
    Container.prototype.get = function(name) {
      if (!(this.resources[name] != null)) {
        throw new Error("Resource '" + name + "' not available");
      }
      return this.resources[name].call(this);
    };
    Container.prototype.describe = function(name, descriptor) {
      this.resources[name] = descriptor;
      return this;
    };
    return Container;
  })();
}).call(this);
