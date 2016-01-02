class @StoryGraph

  # @param nodes [{String: StoryNode}] story nodes identified by their titles
  # @param initialNodeTitle [String] title of the first node of the story
  constructor: (@nodes = {}, @initialNodeTitle = "initial") ->

  # Add a node to the story graph
  #
  # @param node [StoryNode]
  addNode: (node) =>
    @nodes[node.title] = node

  # Return initial node of the story
  getInitialNode: =>
    @nodes[@initialNodeTitle]

  # Return node by id
  #
  # @param title [String] title of the node to find
  getNode: (title) =>
    if !(title of @nodes)
      throw "Node '#{title}' is not in the story graph"
    @nodes[title]


class @StoryNode

  # @param title [String] unique meaningful name to identify this node
  # @param onEnter [function] callback called when the node is entered
  # @param successors [StoryNode[]] possible successor nodes in the story
  constructor: (@title, onEnter, @successors = []) ->
    # use provided onEnter callback if any, else keep default
    if onEnter?
      @onEnter = onEnter

  onEnter: =>
    throw "#{this} has not implemented the 'onEnter' method."


# Story class, only one instance should be created and used as member of @game
# Manages story and mission progression
class @Story

  # story
  storyGraph: null  # game story graph (unique)
  currentStoryNode: null  # current story node (there should always be one during the game)
  currentMission: null  # [Mission] current mission, null if none

  # dictionary of event [string]: hasHappened [bool]
  events:
    "mission01.accepted": false

  constructor: ->

  # @param storyGraph [StoryGraph] story graph of the entire game
  start: (storyGraph) =>
    @storyGraph = storyGraph
    @enterNode storyGraph.getInitialNode()

  # Start or continue story on given node
  #
  # @param storyNode [StoryNode]
  enterNode: (storyNode) =>
    @currentStoryNode = storyNode
    @currentStoryNode.onEnter()  # trigger onEnter events such as notifications

  # Accept new mission and start immediately
  #
  # @param title [String] mission title
  startMission: (title) =>
    if @currentMission != null
      throw new Exception "Cannot start new mission #{title} while there is a current mission, #{@currentMission.title}"
    @currentMission = game.missions[title]
    @currentMission.onStart()
