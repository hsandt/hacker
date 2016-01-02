$("document").ready ->
  console.log "[DOCUMENT] Ready"

  $.get "../../src/modules/hub.html", (data) ->
    $("#content").html(data)
    console.log "DONE"

    Game.nbReadyModules = 0

    $.get "../../src/modules/chat.html", (data) ->
      $("#chatContent").html(data)
      console.log "CHAT DONE"
      incrementNbModulesAndStartIfReady()
    $.get "../../src/modules/terminal.html", (data) ->
      $("#terminalContent").html(data)
      console.log "TERMINAL DONE"
      incrementNbModulesAndStartIfReady()

incrementNbModulesAndStartIfReady = ->
  ++Game.nbReadyModules
  if Game.nbReadyModules == 2
    console.log "[MODULES] Ready, start test"
    testGame()

#  $("#content").load "../../src/modules/hub.html", (response, status, xhr) ->
#    if status != "success"
#      console.log "Loading HTML failed."
#      return
#    console.log "Loaded HTML"
#    testHub()

testGame = ->
  @game = new Game
  game.initModules()
  game.loadData "../../src/data/dialoguegraphs.json"

  # FIXME: load data is async so use a promise

  # start story
  storyGraph = new StoryGraph

  storyGraph.addNode new StoryNode("initial", (-> game.chat.startDialogueByName "test.proposal"),
    ["chapter1"]
  )

  storyGraph.addNode new StoryNode "chapter1", [
      "option",
      "ending"
    ]

  storyGraph.addNode new StoryNode "option", [
      "ending"
    ]

  storyGraph.addNode new StoryNode "ending"

  # IMPROVE: timeout for the dialogue event, not the event
  setTimeout (-> game.story.start(storyGraph)), 1000  # just enough time for async load until we have promises



