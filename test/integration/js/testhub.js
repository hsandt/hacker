// Generated by CoffeeScript 1.10.0
(function() {
  var testHub;

  $("document").ready(function() {
    console.log("[TEST] Hub");
    return $("#content").load("../../src/modules/hub.html", function(response, status, xhr) {
      if (status !== "success") {
        console.log("Loading HTML failed.");
        return;
      }
      console.log("Loaded HTML");
      return testHub();
    });
  });

  testHub = function() {
    return initHub();
  };

}).call(this);

//# sourceMappingURL=testhub.js.map