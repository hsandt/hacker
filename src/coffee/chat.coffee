class @Chat

  # [int] index of next message to receive
  nextIncomingMessageIdx: 0

  # Store references of chat DOM elements as jQuery
  #
  # chatScreen [jQuery] chat-screen div/section
  constructor: (chatScreen) ->
    # jQuery element for the list of messages
    @chatHistory = chatScreen.find ".chat-history"
    @chatHistoryList = @chatHistory.find "ul"
    @chatInput = chatScreen.find ".chat-input"
    @chatInputList = @chatInput.find "ul"

    @receivedMessageTemplate = Handlebars.compile $("#message-received-template").html()
    @sentMessageTemplate = Handlebars.compile $("#message-sent-template").html()
    @messageChoiceTemplate = Handlebars.compile $("#message-choice-template").html()

    @dialogueGraph = null
    @currentDialogueNode = null

  # Start a dialogue graph
  #
  # @param dialogueGraph [DialogueGraph]
  startDialogue: (dialogueGraph) =>
    @dialogueGraph = dialogueGraph
    @enterDialogueNode dialogueGraph.getInitialNode()

  # Continue dialogue on given node
  enterDialogueNode: (dialogueNode) =>
    @currentDialogueNode = dialogueNode

    # receive all messages in the node
    for message in dialogueNode.messages
      @receiveMessage message

    # show choices to send reply
    @showMessageChoices dialogueNode.choices

  # Show new message received in chat history
  #
  # @param message [String] message received
  receiveMessage: (message) =>
    context =
      message: message
      time: "12:00"
    @chatHistoryList.append @receivedMessageTemplate context
    @scrollToBottom()

  # Send message choice to chat
  #
  # @choice [DialogueChoice] message choice to send
  sendMessage: (choice) =>
    # remove choices from input area
    @hideMessageChoices()

    # show chosen message in the chat
    @chatHistoryList.append @sentMessageTemplate(message: choice.message)
    @scrollToBottom()

    # continue dialogue graph following choice consequence
    @enterDialogueNode @dialogueGraph.getNode(choice.nextNodeId)

  # Scroll chat history to bottom
  scrollToBottom: =>
    @chatHistory.animate scrollTop: @chatHistory[0].scrollHeight, 200, "swing"

  # Show available replies for the player
  #
  # @param choices [DialogueChoice[]] list of message choices
  showMessageChoices: (choices) =>
    # show all choices in input area from template
    choices.forEach (choice) =>
      # create <li> jQuery element from template
      choiceEntry = $(@messageChoiceTemplate(choiceMessage: choice.message))
      # add onclick event with choice inside forEach's closure
      choiceEntry.click => @sendMessage choice
      @chatInputList.append choiceEntry

  # Remove choices from input area
  hideMessageChoices: =>
    @chatInputList.empty()

  # display the next message
  receiveNextMessage: =>
    template = Handlebars.compile $("#message-received-template").html()
    context =
      message: Chat.incomingMessageSequence[@nextIncomingMessageIdx],
      time: "12:00"
    @chatHistoryList.append template(context)
    @scrollToBottom()

    ++@nextIncomingMessageIdx

  # display nbMessages every timeInterval in ms
  receiveAllMessages: (nbMessages, timeInterval) =>
    if nbMessages == 0
      return
    @receiveNextMessage()
    setTimeout (=> @receiveAllMessages(nbMessages - 1, timeInterval)), timeInterval


class @DialogueGraph

  # Construct a dialogue node
  #
  # @param nodes [DialogueNode[]] dialogue nodes
  # @param initialNodeId [int] ID of the first node of the dialogue
  constructor: (@nodes = {}, @initialNodeId = 0) ->

  # Add a node to the dialogue graph
  #
  # @param node [DialogueNode]
  addNode: (node) =>
    @nodes[node.id] = node

  # Return initial node of the dialogue
  getInitialNode: =>
    @nodes[@initialNodeId]

  # Return node by id
  #
  # @param [int] id of the node to find
  getNode: (id) =>
    if !(id of @nodes)
      throw "Node #{id} is not in the dialogue graph"
    @nodes[id]


class @DialogueNode

  # Construct a dialogue node
  #
  # @param id [int] messages to receive
  # @param messages [string[]] messages to receive
  # @param choices [DialogueChoice[]] available choices after all messages have been received
  constructor: (@id, @messages, @choices) ->


class @DialogueChoice

  # @param nextNodeId [int] ID of the dialogue node this choice leads to
  constructor: (@idx, @message, @nextNodeId) ->

