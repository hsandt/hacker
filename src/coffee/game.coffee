class @Game

  # domain table of URL [string]: IP [string]
  @dns =
    "google.com": "256.241.23.02"

    # associative array of event [string]: hasHappened [bool]
  events:
    "player_is_dead": false

  # associative array of serverID [string]: server [Server]
  servers:
    "local": new Server "N/A", "456.231.24.57",
      ["home"]
    "google": new Server "google.com", "256.241.23.02",
      ["etc", "home", "var"],
      [
        new DatabaseSim [
          new Table "user_table",
            0: new Google.User 0, "john", "dd6x5few961few68fq4wd6", "California"
        ]
      ]

  # story
  storyGraph: null
  currentStoryNode: null

  constructor: ->

  initModules: =>
    @hub = new Hub
    @terminal = new Terminal $("#terminal-screen")
    @chat = new Chat $("#chat-screen")

  # @param storyGraph [StoryGraph] story graph of the entire game
  startStory: (storyGraph) =>
    @storyGraph = storyGraph
    @enterStoryNode storyGraph.getInitialNode()

  # Start or continue story on given node
  #
  # @param storyNode [StoryNode]
  enterStoryNode: (storyNode) =>
    @currentStoryNode = storyNode
    # trigger onEnter events such as notifications

