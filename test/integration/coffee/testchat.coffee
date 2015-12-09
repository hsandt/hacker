$("document").ready ->
  console.log "[TEST] Chat"

  $("#content").load "../../src/modules/chat.html", (response, status, xhr) ->
    if status != "success"
      console.log "Loading HTML failed."
      return
    console.log "Loaded HTML"
    testChat()

testChat = ->
  chat = new Chat $("#chat-screen")

  dialogueNode0 = new DialogueNode 0,
    [
      "Hi!",
      "How are you?"
    ],
    [
      new DialogueChoice 0, "Fine, thanks.", 1
      new DialogueChoice 1, "Not very good today.", 2
    ]

  dialogueNode1 = new DialogueNode 1,
      [
        "Nice!"
      ],
      [

      ]

  dialogueNode2 = new DialogueNode 2,
    [
      "Oh, sorry for you."
    ],
    [

    ]

#  chat.receiveAllMessages 3, 2000
#  chat.showMessageInputChoiceList()
