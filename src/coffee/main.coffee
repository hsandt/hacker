$ ->
  console.log "[GAME] Ready"

  chat = new Chat $("#chat-screen")

  chat.receiveAllMessages 3, 2000
  chat.showMessageInputChoiceList()

