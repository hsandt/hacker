$ ->
  console.log "[GAME] Ready"

  chat = new Chat $("#chat-screen")

  chat.displayMessageSequence 3, 2000
  chat.showMessageInputChoiceList()
