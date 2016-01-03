class @Game

  # domain table of URL [string]: IP [string]
  @dns =
    "moogle.com": "256.241.23.02"

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
    "moogle": new Server "moogle.com", "256.241.23.02",
      [
        new Directory "etc"
        new Directory "home", [
          new Directory "john"
        ]
        new Directory "var"
      ],
      [
        new DatabaseSim [
          new Table "user_table",
            0: new Google.User 0, "john", "dd6x5few961few68fq4wd6", "California"
        ]
      ]

  constructor: ->

  initModules: =>
    if not game?
      throw new Error "document.game has not been defined, please create a game instance with @game = new Game first."
    @hub = new Hub
    @terminal = @apps['terminal'] = new Terminal $("#terminal-screen"), $("#terminal-device")
    @chat = @apps['chat'] = new Chat $("#chat-screen"), $("#chat-device")
    @apps['phone'] = new App null, null
    @apps['memo'] = new App null, null
    @apps['other'] = new App null, null
    @apps['news'] = new App null, null
    @apps['camera'] = new App null, null

    @story = new Story

  # @param dialogueFilename [String] path of the JSON file containing all dialogues
  loadData: (dialogueFilename) =>
    # [GameData] contains all game story data
    @data = new GameData dialogueFilename

  # @param dialoguesFilename [String] path of the JSON file containing all the localized dialogue lines
  loadLocale: (dialoguesFilename) =>
    @locale = new Localize dialoguesFilename

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

