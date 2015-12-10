$ ->
  console.log "[GAME] Ready"

  $("#content").load "modules/testchat.html", (response, status, xhr) ->
    if status == "success"
      console.log "YES"

      chat = new Chat $("#chat-screen")
      console.log String(chat)
    else
      console.log "NO"


#  chat.receiveAllMessages 3, 2000
#  chat.showMessageInputChoiceList()

