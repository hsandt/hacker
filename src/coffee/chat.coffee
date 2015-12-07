class @Chat

  @incomingMessageSequence = [
    "Hi!",
    "How are you?",
    "Is everything alright?"
  ]

  # index of next message to receive
  nextIncomingMessageIdx: 0

  # array of choices available
  choices: []

  # store references of chat DOM elements as jQuery
  constructor: (chatScreen) ->
    # jQuery element for the list of messages
    @chatHistory = chatScreen.find(".chat-history");
    @chatHistoryList = @chatHistory.find("ul");
    @chatInput = chatScreen.find(".chat-input");
    @chatInputList = @chatInput.find("ul");

  # scroll chat history to bottom
  scrollToBottom: =>
    @chatHistory.animate scrollTop: @chatHistory[0].scrollHeight, 200, "swing"

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

  # send player message
  sendMessage: (messageIdx) =>
    template = Handlebars.compile $("#message-sent-template").html()
    @chatHistoryList.append template(message: @choices[messageIdx].message)
    @scrollToBottom()

# show possible lines / answers the player can send
  showMessageInputChoiceList: =>
    # clear previous choices
    @choices.length = 0

    # add choices from template
    template = Handlebars.compile $("#message-input-choice-template").html()
    choiceMessages = ["Okay", "Get lost!"]
    for i in [0...2]
      console.log i
      choice = new Choice i, choiceMessages[i]
      @choices.push choice
      choiceLi = $(template(choiceMessage: choice.message))
      # add onclick event
      do (i) =>
        choiceLi.click => @sendMessage i
      @chatInputList.append choiceLi


class Choice

  # idx (int): choice index
  # message (string): message content
  constructor: (@idx, @message) ->


