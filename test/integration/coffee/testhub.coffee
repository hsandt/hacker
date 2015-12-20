$("document").ready ->
  console.log "[TEST] Hub"

  $.get "../../src/modules/hub.html", (data) ->
    $("#content").html(data)
    console.log "DONE"
    $.get "../../src/modules/chat.html", (data) ->
      $("#phoneContent").html(data)
      console.log "CHAT DONE"
      testHub()

#  $("#content").load "../../src/modules/hub.html", (response, status, xhr) ->
#    if status != "success"
#      console.log "Loading HTML failed."
#      return
#    console.log "Loaded HTML"
#    testHub()

testHub = ->
  initHub()

