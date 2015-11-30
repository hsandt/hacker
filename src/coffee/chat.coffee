class @Chat

  @incomingMessageSequence = [
    "Hi!",
    "How are you?",
    "Is everything alright?"
  ]

  # jQuery element for the list of messages
  chatHistoryList: $(".chat-history").find("ul");

  # index of next message to receive
  nextIncomingMessageIdx: 0

  displayNextMessage: =>
    template = Handlebars.compile $("#message-template").html()
    context = {
      messageOutput: Chat.incomingMessageSequence[@nextIncomingMessageIdx],
      time: "12:00"
    }
    @chatHistoryList.append template(context)

    ++@nextIncomingMessageIdx

  # display nbMessages every timeInterval in ms
  displayMessageSequence: (nbMessages, timeInterval) =>
    return if nbMessages == 0
    @displayNextMessage()
    setTimeout (=> @displayMessageSequence(nbMessages - 1, timeInterval)), timeInterval

