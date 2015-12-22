$("document").ready ->
  console.log "[TEST] Hub"

  $.get "../../src/modules/hub.html", (data) ->
    $("#content").html(data)
    console.log "DONE"

    Game.nbReadyModules = 0

    $.get "../../src/modules/chat.html", (data) ->
      $("#phoneContent").html(data)
      console.log "CHAT DONE"
      incrementNbModulesAndStartIfReady()
    $.get "../../src/modules/terminal.html", (data) ->
      $("#terminalContent").html(data)
      console.log "TERMINAL DONE"
      incrementNbModulesAndStartIfReady()

incrementNbModulesAndStartIfReady = ->
  ++Game.nbReadyModules
  if Game.nbReadyModules == 2
    console.log "[MODULES] Ready, start test"
    testHub()

#  $("#content").load "../../src/modules/hub.html", (response, status, xhr) ->
#    if status != "success"
#      console.log "Loading HTML failed."
#      return
#    console.log "Loaded HTML"
#    testHub()

testHub = ->
  initHub()

