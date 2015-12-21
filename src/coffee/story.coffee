class @StoryGraph

  # @param nodes [{String: StoryNode}] story nodes identified by their titles
  # @param initialNodeTitle [String] title of the first node of the story
  constructor: (@nodes = {}, @initialNodeTitle = "introduction") ->

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

