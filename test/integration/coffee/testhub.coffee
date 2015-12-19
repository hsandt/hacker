$("document").ready ->
  console.log "[TEST] Hub"

  $("#content").load "../../src/modules/hub.html", (response, status, xhr) ->
    if status != "success"
      console.log "Loading HTML failed."
      return
    console.log "Loaded HTML"
    testHub()

testHub = ->
  initHub()

