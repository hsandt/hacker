class @Terminal

  # Construct terminal from div container
  #
  # terminalScreen [jQuery] jQuery element for the terminal-screen div
  constructor: (terminalScreen) ->
    @output = []  # output lines, including commands entered by the player
    @outputDiv = terminalScreen.find ".output"

    @history = []  # command history
    @promptInput = terminalScreen.find ".prompt-input"

    # set focus and prevent losing focus by brute-force
    @promptInput.focus()
    @promptInput.blur =>
      @promptInput.focus()

    # replace normal submit behavior for prompt
    terminalScreen.find(".prompt-submit").click => @enterCommand @promptInput.val()

  # Send command to fictive shell
  #
  # command [string] command sent to shell
  enterCommand: (command) =>
    # entered command is output with prompt symbol
    @outputDiv.append command + '<br>'
    # computation is done here, output without prompt symbol
    @process(command)
    # empty input field
    @promptInput.val("")

  process: (command) =>
    console.log "[TERMINAL] Processing command '#{command}'"
    # TODO: parser + processing