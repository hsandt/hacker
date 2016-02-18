$("document").ready ->
  console.log "[DOCUMENT] Ready"
  main()

main = ->
  # create game as global (document) variable
  @game = new Game "./"

  # currently app model and window are bound, so need to wait for settings
  # window to be ready to use settings
  # see app.coffee for refactoring ideas
  loadHTMLDeferred = game.loadModules().done ->
    game.initModules()
  dataDeferred = game.loadData "data/dialoguegraphs.json"

  # start story
  storyGraph = new StoryGraph
  storyGraph.addNode new StoryNode("initial",
    (->
      game.playBGM()
      setTimeout((-> game.phone.startDialogueByName "mission-tutorial.proposal"), 2000)),
    ["to-be-continued"]
  )
  storyGraph.addNode new StoryNode("to-be-continued")

  $.when(loadHTMLDeferred, dataDeferred)
    .done -> game.loadLocale(game.settings.lang)
    .done -> game.story.start storyGraph

