class @Game

  # domain table of URL [string]: IP [string]
  @dns =
    "besafe.com": "256.241.23.02"

  apps: {}

  # dictionary of serverID [string]: server [Server]
  servers:
    "local": new Server "local", "456.231.24.57",
      [
        new Directory "home", [
          new Directory "a", [new TextFile "test", "coucou"]
          new Directory "b"
        ]
        new TextFile "a", "hi!"
      ]
    "besafe": new Server "besafe.com", "256.241.23.02",
      [
        new Directory "etc"
        new Directory "locate-e", [
          new Directory "edvige-novik"
          new Directory "edward-claes"
          new Directory "edward-karlsson"
          new Directory "edward-rolland"
          new Directory "egino-morel"
          new Directory "eileen-bruno"
          new Directory "elayne-costa"
          new Directory "elise-geraert", [
            new TextFile "locate-car", "South Region, District 14, Area 2, Building 12 : NewLab Enterprise\nFuel : 83%\nStatus : Scratch on passenger door"
            new TextFile "locate-key", "South Region, District 14, Area 3, Building 5 : University of Neus, VR Seminar Room", "mission-tutorial.conclusion"
            new TextFile "locate-phone", "South Region, District 14, Area 2, Building 12 : NewLab Enterprise"
          ]
          new Directory "elise-giordano"
          new Directory "elise-kieffer"
          new Directory "eleanor-bonnet"
          new Directory "eleanor-petridis"
        ]
        new Directory "var"
      ],
      [
        new DatabaseSim [
          new Table "user_table",
            0: new Google.User 0, "john", "dd6x5few961few68fq4wd6", "California"
        ]
      ]

  # @param srcPath [String] relative path to src folder from main HTML page, ending with '/'
  constructor: (@srcPath) ->
    @audioPath = @srcPath + 'audio/'
    @imagePath = @srcPath + 'img/'

  loadModules: =>
    modulePath = game.srcPath + "modules/"
    $.when($.get(modulePath + "hub.html"), $.get(modulePath + "phone.html"), $.get(modulePath + "terminal.html"))
      .done ([hubHTML, ...], [phoneHTML, ...], [terminalHTML, ...]) ->
        console.log "[LOAD] Loaded Hub, Phone, Terminal HTML"
        $("#content").html hubHTML
        $("#phoneContent").html phoneHTML
        $("#terminalContent").html terminalHTML

  initModules: =>
    if not game?
      throw new Error "document.game has not been defined, please create a game instance with @game = new Game first."
    @hub = new Hub $("#screens"), $("#desk")
    @terminal = @apps['terminal'] = new Terminal $("#terminal-screen"), $("#terminal-device")
    @phone = @apps['phone'] = new Phone $("#phone-screen"), $("#phone-device")
    @apps['chat'] = new App null, null
    @apps['memo'] = new App null, null
    @apps['other'] = new App null, null
    @apps['news'] = new App null, null
#    @apps['camera'] = new App null, null

    @story = new Story

  # @param dialogueFilename [String] path from src of the JSON file containing all dialogues
  loadData: (dialogueFilename) =>
    # [GameData] contains all game story data
    @data = new GameData
    @data.loadDialogueGraphs(game.srcPath + dialogueFilename)

  # @param dialoguesFilename [String] path from src of the JSON file containing all the localized dialogue lines
  loadLocale: (dialoguesFilename) =>
    @locale = new Localize
    @locale.loadDialogueLines(game.srcPath + dialoguesFilename)

  # Return event function by name
  #
  # @param name [String] event name
  getEvent: (name) =>
    @data.eventFunctions[name]

  # Run event function by name
  #
  # @param name [String] event name
  triggerEvent: (name) =>
    @data.eventFunctions[name]()

