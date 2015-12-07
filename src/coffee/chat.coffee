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

  # display the next message
  displayNextMessage: =>
    template = Handlebars.compile $("#message-template").html()
    context =
      messageOutput: Chat.incomingMessageSequence[@nextIncomingMessageIdx],
      time: "12:00"
    @chatHistoryList.append template(context)
    ++@nextIncomingMessageIdx

    @scrollToBottom();

  # display nbMessages every timeInterval in ms
  displayMessageSequence: (nbMessages, timeInterval) =>
    if nbMessages == 0
      return
    @displayNextMessage()
    setTimeout (=> @displayMessageSequence(nbMessages - 1, timeInterval)), timeInterval

  # scroll chat history to bottom
  scrollToBottom: =>
    @chatHistory.animate scrollTop: @chatHistory[0].scrollHeight, 200, "swing"

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
      do (i) ->
        choiceLi.click -> console.log i
      @chatInputList.append choiceLi
      # add onclick event

class Choice

  constructor: (@id, @message) ->


