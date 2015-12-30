class @ChatDevice extends HubDevice

  constructor: ($device) ->
    super $device
    $device.addClass "notify-off"

# If active is true, show a visual cue to notify the player that something new has happened
  # If active is false, stop showing visual cue for new events
  notify: (state = "on") =>
    if !(state in ["on", "off"])
      throw new Exception "notify 'state' argument must be 'on' or 'off'"
    antistate = if state == "on" then "off" else "on"

    # change class to trigger notification style / animation
    @$device.removeClass "notify-#{antistate}"
    @$device.addClass "notify-#{state}"

    if state == "on"
      phoneAudio = new Audio
      phoneAudio.src = '../../src/audio/sfx/phone_notification.wav'
      phoneAudio.play()


class @Chat extends App

  # [int] index of next message to receive
  nextIncomingMessageIdx: 0

  constructor: ($screen, $device) ->
    super $screen, $device
    @device = new ChatDevice $device

    # jQuery element for the list of messages
    @$chatHistory = $screen.find ".chat-history"
    @$chatHistoryList = @$chatHistory.find "ul"
    @$chatInput = $screen.find ".chat-input"
    @$chatInputList = @$chatInput.find "ul"

    @receivedMessageTemplate = Handlebars.compile $("#message-received-template").html()
    @sentMessageTemplate = Handlebars.compile $("#message-sent-template").html()
    @messageChoiceTemplate = Handlebars.compile $("#message-choice-template").html()

    # [DialogueGraph] current dialogue graph
    @dialogueGraph = null
    @currentDialogueNode = null

  # Start a dialogue graph
  #
  # @param dialogueGraph [DialogueGraph]
  startDialogue: (dialogueGraph) =>
    @dialogueGraph = dialogueGraph
    @enterDialogueNode dialogueGraph.getInitialNode()
    # show phone notification on hub
    @device.notify()

  # Continue dialogue on given node
  enterDialogueNode: (dialogueNode) =>
    @currentDialogueNode = dialogueNode

    # receive all messages in the node
    for message in dialogueNode.messages
      @receiveMessage message

    # trigger callback for last message being read
    @currentDialogueNode.onLastMessageRead()

    # show choices to send reply
    @showMessageChoices dialogueNode.choices

  # Show new message received in chat history
  #
  # @param message [String] message received
  receiveMessage: (message) =>
    context =
      message: message
      time: "12:00"
    @$chatHistoryList.append @receivedMessageTemplate(context)
    @scrollToBottom()

  # Choose given choice, triggering all associated events
  #
  # @choice [DialogueChoice]
  choose: (choice) =>
#    for event in choice.events
#      console.log "Game event #{event} -> true"
#      game.events[event] = true
    @sendMessage choice

  # Send message choice to chat
  #
  # @choice [DialogueChoice] message choice to send
  sendMessage: (choice) =>
    # remove choices from input area
    @hideMessageChoices()

    # show chosen message in the chat
    context =
      message: choice.message
      time: "12:00"
    @$chatHistoryList.append @sentMessageTemplate(context)
    @scrollToBottom()

    # continue dialogue graph f.ollowing choice consequence
    @enterDialogueNode @dialogueGraph.getNode(choice.nextNodeId)

  # Scroll chat history to bottom
  scrollToBottom: =>
    @$chatHistory.animate scrollTop: @$chatHistory[0].scrollHeight, 200, "swing"

  # Show available replies for the player
  #
  # @param choices [DialogueChoice[]] list of message choices
  showMessageChoices: (choices) =>
    # show all choices in input area from template
    choices.forEach (choice) =>
      # create <li> jQuery element from template
      choiceEntry = $(@messageChoiceTemplate(choiceMessage: choice.message))
      # add onclick event with choice inside forEach's closure
      choiceEntry.click => @choose choice
      @$chatInputList.append choiceEntry

  # Remove choices from input area
  hideMessageChoices: =>
    @$chatInputList.empty()

  # display the next message
  receiveNextMessage: =>
    template = Handlebars.compile $("#message-received-template").html()
    context =
      message: Chat.incomingMessageSequence[@nextIncomingMessageIdx],
      time: "12:00"
    @$chatHistoryList.append template(context)
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
    # IMPROVE: in JS, objects use strings for keys anyway, so either use an array or any string key
    @nodes[node.id] = node

  # Return initial node of the dialogue
  getInitialNode: =>
    @nodes[@initialNodeId]

  # Return node by id
  #
  # id [int] id of the node to find
  getNode: (id) =>
    if !(id of @nodes)
      throw "Node #{id} is not in the dialogue graph"
    @nodes[id]


class @DialogueNode

  # Construct a dialogue node
  #
  # @param id [int]
  # @param onLastMessageRead [Function()] called when the last message has been sent (and read)
  # @param messages [string[]] messages to receive
  # @param choices [DialogueChoice[]] available choices after all messages have been received
  constructor: (@id, @messages, @choices, @onLastMessageRead = ->) ->

  onEnter: =>
    throw "#{this} has not implemented the 'onEnter' method."


class @DialogueChoice

  # @param idx [int] index in the list of choices, from 0
  # @param message [String] message content
  # @param nextNodeId [int] ID of the dialogue node this choice leads to

  # @param events [String[]] optional list of named events that trigger when this choice is made
  constructor: (@idx, @message, @nextNodeId, @events = []) ->

