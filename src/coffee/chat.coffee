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
      phoneAudio.src = game.audioPath + 'sfx/phone_notification.wav'
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

  # Start a dialogue graph stored in game data, by name
  #
  # @param dialogueName [String] name of the dialogue stored in game data
  startDialogueByName: (dialogueName) =>
    @startDialogue game.data.dialogueGraphs[dialogueName]

  # Start a dialogue graph
  #
  # @param dialogueGraph [DialogueGraph]
  startDialogue: (dialogueGraph) =>
    @dialogueGraph = dialogueGraph
    initialNode = dialogueGraph.getInitialNode()
    @enterDialogueNode initialNode

  # Continue dialogue on given node, by name, or do nothing if nodeName is null
  #
  # @param nodeName [String] name of the node to enter
  enterDialogueNodeByName: (nodeName) =>
    if nodeName?
      @enterDialogueNode @dialogueGraph.getNode(nodeName)

  # Continue dialogue on given node, end if node is null
  #
  # @param dialogueNode [DialogueNode] node to enter
  enterDialogueNode: (dialogueNode) =>
    @currentDialogueNode = dialogueNode
    # if node is null, end dialogue, else enter node
    if dialogueNode?
      dialogueNode.onEnter @
    else
      @dialogueGraph = null

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
    # show phone notification on hub if the player is not already viewing the phone
    if game.hub.currentAppName != 'chat'  # and phone for the phone
      @device.notify()
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
  # @param choices [DialogueChoice[]] list of choice nodes
  showChoices: (choices) =>
    # show all choices in input area from template
    choices.forEach (choice) =>
      if not choice?
        throw new Error "Could not find choice node #{choice.name} in dialogue #{dialogueGraph.name}"
      # create <li> jQuery element from template
      localizedLine = game.locale.getLine choice.lines[0]  # first line is representative for choice
      choiceEntry = $(@messageChoiceTemplate(choiceMessage: localizedLine))
      # add onclick event with choice inside forEach's closure
      choiceEntry.click => @choose choice
      @$chatInputList.append choiceEntry

  # Remove choices from input area
  hideMessageChoices: =>
    @$chatInputList.empty()


class @DialogueGraph

  # @param name [String] dialogue name
  # @param nodes [String: DialogueNode] dictionary of dialogue nodes
  # @param initialNodeName [String] name of the first node of the dialogue
  constructor: (@name, @nodes = {}, @initialNodeName = "initial") ->

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

  toString: =>
    "DialogueGraph #{@name}"


class @DialogueNode

  # Construct a dialogue node
  #
  # @param name [String] string identifier
  # @param type [String] node type: "text", "choice hub" or "choice" (redundant but convenient)
  constructor: (@name, @type) ->

  # Function called when the node is entered. Contains all the node's logic
  #
  # @param chat [Chat] chat managing the dialogue
  onEnter: (chat) =>
    throw new Error "onEnter is not defined for an abstract DialogueNode"

class @DialogueText extends DialogueNode

  # Construct a dialogue node
  #
  # @param name [String] string identifier
  # @param lines [String[]] messages to receive
  # @param successor [DialogueNode] successor node
  constructor: (name, @lines, @successor) ->
    super name, "text"

  toString: =>
    "DialogueText #{@name} -> #{if @successor? then @successor.name else "END"}"

  onEnter: (chat) =>
    # for TEXT nodes, receive all messages in the node
    for lineID in @lines
      chat.receiveMessage game.locale.getLine(lineID)
    # go to next node
    chat.enterDialogueNode @successor


class @DialogueChoiceHub extends DialogueNode

  # @param name [String] string identifier
  # @param choices [DialogueNode] available choices after all messages have been received
  constructor: (name, @choices) ->
    super name, "choice hub"

  toString: =>
    "DialogueChoiceHub #{@name} -> #{@choices.map((e)->e.name).join(", ")}"

  onEnter: (chat) =>
    # for CHOICE HUB nodes, display available choices
    chat.showChoices @choices

class @DialogueChoice extends DialogueNode

  # @param name [String] string identifier
  # @param lines [String[]] messages sent when selecting this choice; the 1st is the one to click on
  # @param successor [DialogueNode] successor node
  constructor: (name, @lines, @successor) ->
    super name, "choice"

  toString: =>
    "DialogueChoice #{@name} '#{@lines.join("; ")}' -> #{if @successor? then @successor.name else "END"}"

  onEnter: (chat) =>
    # for CHOICE node, remove choices, send choice messages and trigger associated effects
    chat.hideMessageChoices()
    for lineID in @lines
      chat.sendMessage game.locale.getLine(lineID)
    chat.enterDialogueNode @successor


# Special dialogue node that calls an event function and immediately goes to the next node
class @DialogueEvent extends DialogueNode

  # @param name [String] string identifier
  # @param eventFunction [Function()] event function to call
  # @param successor [DialogueNode] successor node
  constructor: (name, @eventFunction, @successor) ->
    super name, "event"

  toString: =>
    "DialogueEvent #{@name} -> #{if @successor? then @successor.name else "END"}"

  onEnter: (chat) =>
    # for EVENT node, call the event function and go to next node
    @eventFunction()
    chat.enterDialogueNode @successor


# Node to wait between two nodes; useful to emphasize break in a conversation
class @DialogueWait extends DialogueNode

  # @param name [String] string identifier
  # @param waitTime [float] time to wait in ms
  # @param successor [DialogueNode] successor node
  constructor: (name, @waitTime, @successor) ->
    super name, "wait"

  toString: =>
    "DialogueWait #{@name} (#{@waitTime} ms) -> #{if @successor? then @successor.name else "END"}"

  onEnter: (chat) =>
    # for WAIT node, wait given time and go to next node
    console.log @waitTime
    setTimeout (=> chat.enterDialogueNode @successor), @waitTime
