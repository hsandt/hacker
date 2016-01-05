// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.HubDevice = (function() {
    function HubDevice($device) {
      this.$device = $device;
      this.notify = bind(this.notify, this);
    }

    HubDevice.prototype.notify = function(state) {
      if (state == null) {
        state = "on";
      }
      return console.log("notify (state = " + state + ") has not been defined on device " + this);
    };

    return HubDevice;

  })();

}).call(this);

//# sourceMappingURL=hubdevice.js.map
