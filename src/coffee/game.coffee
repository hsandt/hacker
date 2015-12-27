class @Game

  # domain table of URL [string]: IP [string]
  @dns =
    "moogle.com": "256.241.23.02"

  apps: {}

  # associative array of serverID [string]: server [Server]
  servers:
    "local": new Server "local", "456.231.24.57",
      [
        new Directory "home", [
          new Directory "a", [new TextFile "test", "coucou"]
          new Directory "b"
        ]
      ]
    "moogle": new Server "moogle.com", "256.241.23.02",
      [
        new Directory "etc"
        new Directory "home", [
          new Directory "john", [
            new TextFile "mail", "I went to the cinema the other day. If you could see my boss, he was just crazy!\n
                                  I told him I had an important meeting with an ex-collaborator."
          ]
        ]
        new Directory "var"
      ],
      [
        new DatabaseSim [
          new Table "user_table",
            0: new Google.User 0, "john", "dd6x5few961few68fq4wd6", "California"
        ]
      ]

  # story
  storyGraph: null
  currentStoryNode: null

  # associative array of event [string]: hasHappened [bool]
  events:
    "mission01.accepted": false

  constructor: ->

  initModules: =>
    @hub = new Hub
    @terminal = @apps['terminal'] = new Terminal $("#terminal-screen"), $("#terminal-device")
    @chat = @apps['chat'] = new Chat $("#chat-screen"), $("#chat-device")
    @apps['phone'] = new App null, null
    @apps['memo'] = new App null, null
    @apps['other'] = new App null, null
    @apps['news'] = new App null, null
    @apps['camera'] = new App null, null

  # @param storyGraph [StoryGraph] story graph of the entire game
  startStory: (storyGraph) =>
    @storyGraph = storyGraph
    @enterStoryNode storyGraph.getInitialNode()

  # Start or continue story on given node
  #
  # @param storyNode [StoryNode]
  enterStoryNode: (storyNode) =>
    @currentStoryNode = storyNode
    @currentStoryNode.onEnter()
    # trigger onEnter events such as notifications

