// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.App = (function() {
    function App($screen, $device) {
      this.$screen = $screen;
      this.onClose = bind(this.onClose, this);
      this.onOpen = bind(this.onOpen, this);
    }

    App.prototype.onOpen = function() {
      return console.log("[APP] " + this + " onOpen");
    };

    App.prototype.onClose = function() {
      return console.log("[APP] " + this + " onClose");
    };

    return App;

  })();

}).call(this);

//# sourceMappingURL=app.js.map
