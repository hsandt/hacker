# Abstract base class for IRC and phone apps
class @Chat extends App

  # [bool] Safety flag that is true when the first message in the queue
  # has a timeout pending, to avoid sending the same message twice
  isPreparingNextMessage: false
  # [bool] Is the player character typing on the phone?
  isTyping: false
  # [bool] Should the player type a message when he/she opens the chat next time?
  mustType: false

  # [DialogueGraph] current dialogue graph
  @dialogueGraph: null
  # [DialogueNode] current dialogue node
  @currentDialogueNode: null

  # OPTIMIZE: use Queue.js if an array is too slow (only better over 2 elements,
  # and we have an average of 2 lines per text node)
  # [Message[]] queue of messages to be sent
  messageQueue: []

  constructor: ($screen) ->
    super $screen

    # jQuery element for the list of messages
    @$chatHistory = $screen.find ".history"
    @$chatHistoryList = @$chatHistory.find "ul"
    @$chatInput = $screen.find ".input"
    @$chatInputList = @$chatInput.find "ul"

    @receivedMessageTemplate = Handlebars.compile($("#message-received-template").html())
    @sentMessageTemplate = Handlebars.compile $("#message-sent-template").html()
    @messageChoiceTemplate = Handlebars.compile $("#message-choice-template").html()

  # [override]
  checkCanClose: =>
    if @isTyping
      console.log "[CHAT] Cannot close #{@appName}, player character is typing"
    return not @isTyping

  # [override]
  onOpen: =>
    @device.notify false
    if @mustType
      # current hub app has been set to Chat subclass name,
      # so calling @prepareNextMessage should correctly send the PC's next message now
      @prepareNextMessage()

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
    if @currentDialogueNode?
      @currentDialogueNode.onExit @
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

  # Send or receive message depending on sender
  #
  # @param sender [String] message sender
  sendOrReceiveMessage: (message) =>
    if message.sender == "pc"
      sendMessage message
    else
      receiveMessage message

  # Send message choice to chat
  #
  # @param message [Message] message to send
  sendMessage: (message) =>
    @printMessage message, @sentMessageTemplate

  # Show new message received in chat history
  #
  # @param message [Message] message received
  receiveMessage: (message) =>
    # show phone notification on hub if the player is not already viewing the phone
    if game.hub.currentAppName != @appName  # "irc" for IRC, "phone" for the phone
      @device.notify()
    @printMessage message, @receivedMessageTemplate

  # Print message from character in chat
  #
  # @param message [Message] message to print
  # @param template [Handlebars.Template] message template corresponding to the character speaking
  printMessage: (message, template) =>
    # REFACTOR: character name localization system with tag ("mathilde" or "$C2" for more hardcore)
    if message.sender == "pc"
      # use 'pc' for any player character message, then add % in front of name
      senderCode = "you"
    else
      senderCode = message.sender
    sender = game.locale.getName(senderCode)
    context =
      message: message.content
      sender: sender
      time: message.date
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

  # Set timer to send/receive next message in the queue if any, else enter next node
  prepareNextMessage: =>
#    console.log "[CHAT] prepareNextMessage()"
    # set flag to avoid preparing the same message a 2nd time later
    @isPreparingNextMessage = true
    if @messageQueue.length > 0
      # prepare to send/receive next message in the queue
#      console.log "[CHAT] Get next message from queue"
      nextMessage = @messageQueue[0]

      # if message from player character and player is not viewing this app,
      # do not let player character type message until this is the case
      if nextMessage.sender == "pc"
        if game.hub.currentAppName == @appName or true
          @isTyping = true
          @mustType = false  # if chat was closed before and mustType flag was set, revert it now
        else
          console.log "[CHAT] #{@appName} is closed, will type message next time chat is entered"
          @mustType = true
          return

      # prepare timer to send or receive future next message
      setTimeout (=> @processNextMessage()), nextMessage.sendTime

    else
      # last message processed, go to next node (unique successor of the current text or choice node)
      @enterDialogueNode @currentDialogueNode.successor

  # Receive message passed as parameter and
  processNextMessage: =>
    # release flag, can prepare another message from here
    @isPreparingNextMessage = false
    # send or receive message just arriving now
    message = @messageQueue.shift()
    if message.sender == "pc"
      @sendMessage message
      # the player character is not typing anymore and may leave the app (unless she starts writing another message now)
      @isTyping = false
    else
      @receiveMessage message

    @prepareNextMessage()

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

  onExit: (chat) =>


class @DialogueText extends DialogueNode

  # Construct a dialogue node
  #
  # @param name [String] string identifier
  # @param lines [String[]] messages to receive
  # @param successor [DialogueNode] successor node
  # @param speaker [String] speaker, either "pc" (player character) or "other"
  constructor: (name, @lines, @successor, @speaker = "pc") ->
    super name, "text"

  toString: =>
    "DialogueText #{@name} -> #{if @successor? then @successor.name else "END"}"

  onEnter: (chat) =>
    # for TEXT nodes, either send or receive all messages in the node, depending on the sender
    # to do this timely, create a queue of messages waiting to be sent
    for lineID in @lines
      line = game.locale.getLine(lineID)
      # natural thinking + typing waiting time before sending message, affine of length message
      typingTime = 1500 + 20 * line.length
      console.log "Message thinking/typing time of '#{line}': #{typingTime/1000}s"
      chat.messageQueue.push new Message(@speaker, "2027", line, typingTime)

    # process queue by starting with first message
    chat.prepareNextMessage()


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

  onExit: (chat) =>
    chat.hideMessageChoices()

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
    for lineID, i in @lines
      line = game.locale.getLine(lineID)
      # typing time is similar to text node calculation, except the 1st message is immediate
      # (assume the player character has typed it while you were thinking which choice to make)
      typingTime = if i == 0 then 0 else 1500 + 20 * line.length
      console.log "Message thinking/typing time of #{line}: #{typingTime/1000}s"
      chat.messageQueue.push new Message("pc", "2027", line, typingTime)

    chat.prepareNextMessage()

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


# Any kind of message sent in a chat from a character to another
class @Message

  # @param sender [String] name of the sender
  # @param date [String] day when message is sent
  # @param content [String] message text content
  # @param sendTime [String] thinking + typing time for that message
  constructor: (@sender, @date, @content, @sendTime) ->


class @Phone extends Chat

  appName: "phone"

  constructor: ($screen, $device) ->
    super $screen
    @device = new PhoneDevice $device


class @PhoneDevice extends HubDevice

  constructor: ($device) ->
    super $device

    @phoneAudio = new Audio
    @phoneAudio.src = game.audioPath + 'sfx/phone_notification.mp3'
#    @phoneAudio.loop = true

    $device.addClass "notify-off"

  # If active is true, show a visual cue to notify the player that something new has happened
  # If active is false, stop showing visual cue for new events
  # If notification is already in this state, though, nothing happens
  notify: (active = true) =>
    if @notificationActive == active
      return

    @notificationActive = active
    state = if active then "on" else "off"
    oppositeState = if active then "off" else "on"

    # change class to trigger notification style / animation
    @$device.removeClass "notify-#{oppositeState}"
    @$device.addClass "notify-#{state}"

    if active
      @phoneAudio.play()

    else
      @phoneAudio.pause()
      @phoneAudio.currentTime = 0

