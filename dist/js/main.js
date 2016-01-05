// Generated by CoffeeScript 1.10.0
(function() {
  var main;

  $("document").ready(function() {
    console.log("[DOCUMENT] Ready");
    return main();
  });

  main = function() {
    var dataDeferred, lang, loadHTMLDeferred, localeDeferred, storyGraph;
    lang = "fr";
    this.game = new Game("./");
    loadHTMLDeferred = game.loadModules().done(function() {
      return game.initModules();
    });
    dataDeferred = game.loadData("data/dialoguegraphs.json");
    localeDeferred = game.loadLocale("localize/" + lang + "/dialogues.json");
    storyGraph = new StoryGraph;
    storyGraph.addNode(new StoryNode("initial", (function() {
      return setTimeout((function() {
        return game.phone.startDialogueByName("mission-test.proposal");
      }), 1500);
    }), ["to-be-continued"]));
    storyGraph.addNode(new StoryNode("to-be-continued"));
    return $.when(loadHTMLDeferred, dataDeferred, localeDeferred).done(function() {
      return game.story.start(storyGraph);
    });
  };

}).call(this);

//# sourceMappingURL=main.js.map
