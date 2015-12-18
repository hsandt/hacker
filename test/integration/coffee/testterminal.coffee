$ ->
  console.log "[TEST] Terminal"

  $("#content").load "../../src/modules/terminal.html", (response, status, xhr) ->
    if status != "success"
      console.log "Loading HTML failed."
      return
    console.log "Loaded HTML"
    testTerminal()

testTerminal = ->
  @terminal = new Terminal $("#terminal-screen")
