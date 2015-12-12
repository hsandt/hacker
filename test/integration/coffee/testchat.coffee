$ ->
  console.log "[TEST] Chat"

  $("#content").load "../../src/modules/chat.html", (response, status, xhr) ->
    if status != "success"
      console.log "Loading HTML failed."
      return
    console.log "Loaded HTML"
    testChat()

testChat = ->
  chat = new Chat $("#chat-screen")

  dialogueGraph = new DialogueGraph

  dialogueGraph.addNode new DialogueNode 0,
    [
      "Hi!",
      "How are you?"
    ],
    [
      new DialogueChoice 0, "Fine, thanks.", 1
      new DialogueChoice 1, "Not very good today.", 2
    ]

  dialogueGraph.addNode new DialogueNode 1,
      [
        "Nice!"
      ],
      [
        new DialogueChoice 0, "What about you?", 3
        new DialogueChoice 1, "Okay, time to start business", 5
      ]

  dialogueGraph.addNode new DialogueNode 2,
    [
      "Oh, sorry for you."
    ],
    [
      new DialogueChoice 0, "Thanks.", 5
      new DialogueChoice 1, "As if you would ever...", 4
      new DialogueChoice 2, "Anyway, time to start business", 5
    ]

  dialogueGraph.addNode new DialogueNode 3,
    [
      "I am fine, thanks."
    ],
    [
      new DialogueChoice 0, "Fine, time to start business", 5
    ]

  dialogueGraph.addNode new DialogueNode 4,
    [
      "No, really, I mean it!"
    ],
    [
      new DialogueChoice 0, "Anyway, time to start business", 5
    ]

  dialogueGraph.addNode new DialogueNode 5,
    [
      "So what about talking about our next project?"
    ],
    [
    ]

  chat.startDialogue dialogueGraph

#  chat.receiveAllMessages 3, 2000
#  chat.showMessageInputChoiceList()
