$("document").ready ->
  console.log "[DOCUMENT] Ready"

  $.get "../../src/modules/hub.html", (data) ->
    $("#content").html(data)
    console.log "DONE"

    Game.nbReadyModules = 0

    $.get "../../src/modules/chat.html", (data) ->
      $("#phoneContent").html(data)
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

  # start story
  storyGraph = new StoryGraph

  # create dialogue

  dialogueGraph = new DialogueGraph

  dialogueGraph.addNode new DialogueNode 0,
    [
      "Hi! I have a mission for you.",
    ],
    [
      new DialogueChoice 0, "What is it?", 1
      new DialogueChoice 1, "I refuse.", 2
    ]

  dialogueGraph.addNode new DialogueNode 1,
    [
      "You have to hack into Moogle's server and tell me what John did yesterday."
    ],
    [
      new DialogueChoice 0, "I accept.", 3, ["mission01.accepted"]
      new DialogueChoice 1, "I refuse.", 2
    ]

  dialogueGraph.addNode new DialogueNode 2,
    [
      "Goodbye, then."
    ],
    [
    ]

  dialogueGraph.addNode new DialogueNode 3,
    [
      "Okay, then connect to moogle.com and read the activity log of John."
    ],
    [
    ]

  storyGraph.addNode new StoryNode("introduction", (-> game.chat.startDialogue(dialogueGraph)),
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
  setTimeout (-> game.startStory(storyGraph)), 1000



