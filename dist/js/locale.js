// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Localize = (function() {
    function Localize() {
      this.getLine = bind(this.getLine, this);
      this.buildDialogueLines = bind(this.buildDialogueLines, this);
      this.loadDialogueLines = bind(this.loadDialogueLines, this);
    }

    Localize.prototype.loadDialogueLines = function(dialoguesFilename) {
      return $.getJSON(dialoguesFilename, this.buildDialogueLines).done(function() {
        return console.log("[LOAD] Loaded localized dialogue lines");
      });
    };

    Localize.prototype.buildDialogueLines = function(data) {
      return this.dialogueLines = data;
    };

    Localize.prototype.getLine = function(lineID) {
      var lineNo, missionID, ref, textNo;
      ref = lineID.split('_'), missionID = ref[0], textNo = ref[1], lineNo = ref[2];
      return this.dialogueLines[missionID][textNo][lineNo];
    };

    return Localize;

  })();

}).call(this);

//# sourceMappingURL=locale.js.map
