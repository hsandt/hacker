$("document").ready ->
  console.log "[DOCUMENT] Ready"
  main()

main = ->
  lang = "fr"

  @game = new Game "./"

  loadHTMLDeferred = game.loadModules().done ->
    game.initModules()
  dataDeferred = game.loadData "data/dialoguegraphs.json"
  localeDeferred = game.loadLocale "localize/#{lang}/dialogues.json"

  # start story
  storyGraph = new StoryGraph
  storyGraph.addNode new StoryNode("initial",
    (-> setTimeout((-> game.phone.startDialogueByName "mission-test.proposal"), 1500)),
    ["to-be-continued"]
  )
  storyGraph.addNode new StoryNode("to-be-continued")

  $.when(loadHTMLDeferred, dataDeferred, localeDeferred).done ->
    game.story.start storyGraph
