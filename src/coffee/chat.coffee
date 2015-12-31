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
    initialNode = dialogueGraph.getInitialNode()
    @enterDialogueNode initialNode
    # show phone notification on hub if the NPC starts the dialogue
    if initialNode.type == "text"
      @device.notify()

  # Continue dialogue on given node, by name, or do nothing if nodeName is null
  #
  # @param nodeName [String] name of the node to enter
  enterDialogueNodeByName: (nodeName) =>
    if nodeName?
      @enterDialogueNode @dialogueGraph.getNode(nodeName)

  # Continue dialogue on given node
  #
  # @param dialogueNode [DialogueNode] node to enter
  enterDialogueNode: (dialogueNode) =>
    @currentDialogueNode = dialogueNode

    switch dialogueNode.type
      when "text"
        # for TEXT nodes, receive all messages in the node
        for line in dialogueNode.lines
          @receiveMessage line
        # trigger callback for last message being read
        dialogueNode.onLastRead()
        # go to next node
        @enterDialogueNodeByName dialogueNode.successor

      when "choice hub"
        # for CHOICE HUB nodes, display available choices
        @showChoicesByName dialogueNode.choices

      when "choice"
        # for CHOICE node, remove choices, send choice messages and trigger associated effects
        @hideMessageChoices()
        for line in dialogueNode.lines
          @sendMessage line
        @enterDialogueNodeByName dialogueNode.successor

  # Choose given choice, triggering all associated events
  #
  # @choice [DialogueChoice]
  choose: (choice) =>
#    for event in choice.events
#      console.log "Game event #{event} -> true"
#      game.events[event] = true
    @enterDialogueNode choice

  # Send message choice to chat
  #
  # @param message [String] message to send
  sendMessage: (message) =>
    @printMessage message, @sentMessageTemplate

  # Show new message received in chat history
  #
  # @param message [String] message received
  receiveMessage: (message) =>
    @printMessage message, @receivedMessageTemplate

  # Print message from character in chat
  #
  # @param message [String] message to print
  # @param template [Handlebars.Template] message template corresponding to the character speaking
  printMessage: (message, template) =>
    context =
      message: message
      time: "12:00"
    @$chatHistoryList.append template(context)
    @scrollToBottom()

  # Scroll chat history to bottom
  scrollToBottom: =>
    @$chatHistory.animate scrollTop: @$chatHistory[0].scrollHeight, 200, "swing"

  # Show available replies for the player
  #
  # @param choiceNames [String[]] list of choice node names
  showChoicesByName: (choiceNames) =>
    # show all choices in input area from template
    choiceNames.forEach (choiceName) =>
      choice = @dialogueGraph.getNode choiceName
      # create <li> jQuery element from template
      choiceEntry = $(@messageChoiceTemplate(choiceMessage: choice.lines[0]))
      # add onclick event with choice inside forEach's closure
      choiceEntry.click => @choose choice
      @$chatInputList.append choiceEntry

  # Remove choices from input area
  hideMessageChoices: =>
    @$chatInputList.empty()


class @DialogueGraph

  # @param nodes [String: DialogueNode] dictionary of dialogue nodes
  # @param initialNodeName [String] name of the first node of the dialogue
  constructor: (@nodes = {}, @initialNodeName = "initial") ->

  # Add a node to the dialogue graph
  #
  # @param node [DialogueNode]
  addNode: (node) =>
    # IMPROVE: in JS, objects use strings for keys anyway, so either use an array or any string key
    @nodes[node.name] = node

  # Return initial node of the dialogue
  getInitialNode: =>
    @nodes[@initialNodeName]

  # Return node by id, null if none found
  #
  # name [String] id of the node to find
  getNode: (name) =>
    if not (name of @nodes)
      console.warn "[DIALOGUE] Node #{name} not found"
      return null
    @nodes[name]


class @DialogueNode

  # Construct a dialogue node
  #
  # @param name [String] string identifier
  # @param type [String] node type: "text", "choice hub" or "choice" (redundant but convenient)
  constructor: (@name, @type) ->


class @DialogueText extends DialogueNode

  # Construct a dialogue node
  #
  # @param name [String] string identifier
  # @param lines [String[]] messages to receive
  # @param successor [String] name of the successor node
  # @param onLastRead [Function()] called when the last line has been sent (and read)
  constructor: (name, @lines, @successor, @onLastRead = ->) ->
    super name, "text"


class @DialogueChoiceHub extends DialogueNode

  # @param name [String] string identifier
  # @param choices [DialogueChoice[]] available choices after all messages have been received
  constructor: (name, @choices) ->
    super name, "choice hub"


class @DialogueChoice extends DialogueNode

  # @param name [String] string identifier
  # @param lines [String[]] messages sent when selecting this choice; the 1st is the one to click on
  # @param successor [String] name of the successor node
  constructor: (name, @lines, @successor) ->
    super name, "choice"

