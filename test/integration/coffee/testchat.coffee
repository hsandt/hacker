$("document").ready ->
  console.log "[TEST] Chat"

  $("#content").load "../../src/modules/chat.html", (response, status, xhr) ->
    if status != "success"
      console.log "Loading HTML failed."
      return
    console.log "Loaded HTML"
    do testChat(5)

testChat = ->
  chat = new Chat $("#chat-screen")
  chat.receiveAllMessages 3, 2000
  chat.showMessageInputChoiceList()
