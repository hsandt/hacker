import Game from './game'
import { StoryGraph, StoryNode } from './story'

$("document").ready(function() {
    console.log("[DOCUMENT] Ready");
    return main();
});

function main () {
    // create game as global (document) variable
    window.game = new Game("./");

    // currently app model and window are bound, so need to wait for settings
    // window to be ready to use settings
    // see app.coffee for refactoring ideas
    let loadHTMLDeferred = game.loadModules().done(() => game.initModules());
    let dataDeferred = game.loadData("data/dialoguegraphs.json");

    // start story
    let storyGraph = new StoryGraph();
    storyGraph.addNode(new StoryNode("initial",
        (function() {
            game.playBGM();
            return setTimeout((() => game.phone.startDialogueByName("mission-tutorial.proposal")), 2000);}),
        ["to-be-continued"]
        )
    );
    storyGraph.addNode(new StoryNode("to-be-continued"));

    return $.when(loadHTMLDeferred, dataDeferred)
        .done(() => game.loadLocale(game.settings.lang))
        .done(() => game.story.start(storyGraph));
}

