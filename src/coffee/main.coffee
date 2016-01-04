$("document").ready ->
  console.log "[DOCUMENT] Ready"
  main()

#  $("#content").load "src/modules/hub.html", (response, status, xhr) ->
#    if status != "success"
#      console.log "Loading HTML failed."
#      return
#    console.log "Loaded HTML"
#    testHub()

main = ->
  lang = "fr"

  @game = new Game "./"
  moduleDeferred = game.loadModules().done ->
    console.log "[LOAD] Loaded modules"
    game.initModules()
  dataDeferred = game.loadData "data/dialoguegraphs.json"
  localeDeferred = game.loadLocale "localize/#{lang}/dialogues.json"

  # start story
  storyGraph = new StoryGraph
  storyGraph.addNode new StoryNode("initial",
    (-> setTimeout((-> game.chat.startDialogueByName "mission-test.proposal"), 1500)),
    ["to-be-continued"]
  )
  storyGraph.addNode new StoryNode("to-be-continued")

  $.when(moduleDeferred, dataDeferred, localeDeferred).done ->
    game.story.start storyGraph
