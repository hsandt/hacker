class @TerminalDevice extends HubDevice

  # If active is true, show a visual cue to notify the player that something new has happened
  # If active is false, stop showing visual cue for new events
  notify: (state = "on") =>
#    if !(state in ["on", "off"])
#      throw Exception "notify 'state' argument must be 'on' or 'off'"
#    antistate = if state == "on" then "off" else "on"

    # change class to trigger notification style / animation
#    @$device.removeClass "notify-#{antistate}"
#    @$device.addClass "notify-#{state}"

    if state == "on"
      console.log "TERMINAL NOTIFY ON"

CommandToken =
    void: "void"
    clear: "clear"
    help: "help"
    ls: "ls"
    dir: "ls"
    cd: "cd"
    cat: "cat"
    connect: "connect"


class @Terminal extends App

  # Construct terminal from div container
  #
  # $screen [jQuery] jQuery element for the terminal-screen div
  constructor: ($screen, $device) ->
    super $screen, $device
    @device = new TerminalDevice $device

    @interpreter = new CommandInterpreter @

    @output = []  # [String[]] output lines, including commands entered by the player
    @$output = $screen.find ".output"

    @history = [""]  # [String[]] command history, as a reversed queue, with last buffer as 1st element
    @historyIndex = 0  # [int] current index of command-line history, 0 for current buffer, 1 for previous command, etc.
    @$promptInput = $screen.find ".prompt-input"

    @connectionStack = []  # [Server[]] stack of servers through which you connected, last is current server
    @directoryStack = []  # [Directory[]] stack of directories corresponding to path to working directory

    # connect terminal to local server (will also set working dir to its root)
    @connect game.servers["local"]

    # bind up/down arrow press to history navigation
    @$promptInput.keydown (event) =>
      switch event.which
        when Keycode.UP
          @navigateHistory 1
          false  # stop propagation
        when Keycode.DOWN
          @navigateHistory -1
          false  # stop propagation

    # replace normal submit behavior for prompt
    $screen.find(".prompt-submit").click => @enterCommand @$promptInput.val()

  # Current server get property
  @getter 'currentServer', -> @connectionStack[@connectionStack.length - 1]

  # Current directory get property
  @getter 'currentDirectory', -> @directoryStack[@directoryStack.length - 1]


  ### OPEN/CLOSE ###

  # Focus on terminal prompt
  onOpen: =>
    # set initial focus and prevent losing focus by brute-force
    @$promptInput.focus()
    @$promptInput.on "blur.autofocus", =>
      @$promptInput.focus()

  # Leave focus and unbind forced focus rule
  onClose: =>
    @$promptInput.off "blur.autofocus"
    @$promptInput.blur()


  ### INPUT/OUTPUT ###

  # Navigate in command-line history up or down as much as possible
  #
  # delta [int] 1 to go to next command, -1 to go to previous command
  navigateHistory: (delta) =>
    if @historyIndex > 0 and delta == -1
      console.log "-1"
      --@historyIndex
      @$promptInput.val @history[@historyIndex]
    else if @historyIndex < @history.length - 1 and delta == 1
      console.log "+1"
      if @historyIndex == 0
        # if you enter history navigation mode, remember current input for later
        @history[0] = @$promptInput.val()
      ++@historyIndex
    else return
    @$promptInput.val @history[@historyIndex]

  # Send a sanitized text to the terminal output, on one line
  #
  # lines [String...]
  print: (lines...) =>
    for line in lines
      @$output.append(document.createTextNode(line)).append '<br>'

  # Send a raw text to the terminal output, on one line
  #
  # lines [String...]
  printHTML: (lines...) =>
    for line in lines
      @$output.append(line).append '<br>'

  scrollToBottom: =>
    # cancel previous animations and start smooth scroll from current position
#    console.log "scroll #{@$output[0].scrollHeight}"
    @$output.stop()
    @$output.animate scrollTop: @$output[0].scrollHeight, 200, "swing"


  ### CORE ACTIONS ###

  # Print file content to output and trigger any game event hooked
  #
  # @param [TextFile] text file to read
  printText: (textFile) =>
    # WARNING: printHTML will print the text content as HTML; use HTML symbols
    # in your text data or make a conversion from JSON strings beforehand!
    @printHTML textFile.content.replace /\n/g, '<br>'
    # trigger game events related to reading this file
    textFile.onRead()

  # Connect to a server
  #
  # server [Server] target server
  connect: (server) =>
    @connectionStack.push server
    # set current working directory to root of this server
    @directoryStack.length = 0
    @directoryStack.push @currentServer.getRoot()


  ### COMMANDS ###

  # Send command to fictive shell
  #
  # command [string] command sent to shell
  enterCommand: (commandLine) =>
    # record entered command in history and reset history position to 0
    @history[0] = commandLine
    @history.unshift ""
    @historyIndex = 0

    # empty input field
    @$promptInput.val("")

    # output entered command with prompt symbol (multiple whitespaces will be reduced to one by HTML)
    @print '> ' + commandLine

    # interpret command if you can, else show error message
    try
      syntaxTree = @interpreter.parse commandLine
    catch error
      @print error.message
      @scrollToBottom()
      return

    try
      # pass the current process to execute the syntax tree (here, the terminal object)
      # so that the child process can print to output, open another interpreter inside, etc.
      @interpreter.execute syntaxTree, @
    catch error
      @print error.message

    @scrollToBottom()

  # Clear the output content, but keep the input history
  clearCommand: =>
    @$output.empty()

  # Show available commands information
  helpCommand: =>
    @print "List of available commands:",
      "clear -- clear the console output",
      "help -- show this help menu",
      "ls -- show files and subdirectories in current directory",
      "cd -- navigate to subdirectory",
      "cat <file> -- print content of text file to console output",
      "connect <domain> -- connect to a domain by URL or IP",

  # Show files and subdirectories in directory at relative path
  #
  # @param pathname [String] relative path with 'a/b' format
  lsCommand: (pathname) =>
    # IMPROVE: support pathname
    for file in @currentDirectory.children
      @print file.toString()

  # Enter directory at relative path
  #
  # @param pathname [String] relative path with 'a/b' format
  cdCommand: (pathname) =>
    # on unix, cd with no arguments sends back to the user's home directory; there is no 'root' home dir so let's go to /
    if not pathname?
      newDirectoryStack = [@directoryStack[0]]  # only keep ROOT directory (not root home); works if no other ref to this array
    else
      pathChain = pathname.split '/'
      newDirectoryStack = @directoryStack[..]  # work on stack copy in case it fails in the middle
      for nextDirName in pathChain
        if nextDirName in ['.', '']
          continue
        if nextDirName == '..'
          # do not pop if already at ROOT
          if newDirectoryStack.length > 1
            newDirectoryStack.pop()
        else
          # nextDirName is assumed to be a normal name
          nextDir = newDirectoryStack[newDirectoryStack.length - 1].getChildDir nextDirName
          # if path cannot be resolved at this step, STOP, no such directory found, do not change directory
          if not nextDir? then throw new Error "cd: #{pathname}: No such directory"
          newDirectoryStack.push nextDir

    @directoryStack = newDirectoryStack  # array ref changes here again

  # Print text file content to output
  #
  # @param filename [String] name of a text file to read
  catCommand: (filename) =>
    if not filename?
      # unix cat open stream for free input, but we do not need this in the game
      throw new SyntaxError "The cat command requires 1 argument: the name of a text (.txt) file"

    if filename[-4..] == ".txt"
    # remove .txt extension for the search by name
      filename = filename[0...-4]

    # IMPROVE: support path + filename
    textFile = @currentDirectory.getFile TextFile, filename
    if not textFile?
      throw new Error "cat: #{filename}: No such file"
    @printText textFile

  # Connect to server by domain URL or IP
  #
  # @param address [String] domain URL or IP address
  connectCommand: (address) =>
    if not address?
      throw new SyntaxError "The connect command requires 1 argument: the domain URL or IP"
    server = Server.find(address)
    if not server?
      @print "Could not resolve hostname / IP #{address}"
    else
      @connect server
      @print "Connected to #{address}"


# Class responsible for syntax analysis (parsing) and execution
# of the command-lines in the terminal
class @CommandInterpreter

  # @param terminal [Terminal] terminal receiving the commands
  constructor: (@terminal) ->

  # Parse a command and return a syntax tree made of tokens
  # Throw an exception if a parsing error occurs
  #
  # commandLine [string] command sent to shell
  parse: (commandLine) =>
    console.log "[TERMINAL] Parse '#{commandLine}'"
    # multi-word analysis
    # trim whitespaces and separate command from arguments
    [command, commandArgs...] = commandLine.trim().split(/\s+/)
    if command == ""
      return new SyntaxTree [CommandToken.void, []]
    if !(command of CommandToken)
      throw SyntaxError "#{command}: command not found"
    new SyntaxTree [CommandToken[command], commandArgs]

  # Execute command with arguments provided in syntax tree
  # All commands interpretation consist in giving semantics to each argument and delegating back to the terminal
  #
  # @param syntaxTree [SyntaxTree] : multi-dimensional array containing the command line tokens
  # @param terminal [Terminal] : represents the parent process
  execute: (syntaxTree, terminal) =>
    console.log "[TERMINAL] Execute #{syntaxTree}"
    @[syntaxTree.getCommand()] syntaxTree.getArgs()

  # For all methods below, execute command line with following parameters
  #
  # @param args [Terminal] : arguments of the invoked command
  # @param terminal [Terminal] : represents the parent process

  # Do nothing
  void: (args) =>

  # Delegate clear command to terminal
  clear: (args) =>
    @terminal.clearCommand()

  # Delegate help command to terminal
  help: (args) =>
    @terminal.helpCommand()

  # Delegate ls command to terminal for given pathname
  ls: (args) =>
    @terminal.lsCommand args[0]

  # Delegate cd command to terminal for given pathname
  cd: (args) =>
    @terminal.cdCommand args[0]

  # Delegate cat command to terminal for given filename
  cat: (args) =>
    @terminal.catCommand args[0]

  # Delegate ls command to terminal for given address
  connect: (args) =>
    @terminal.connectCommand args[0]


class @SyntaxTree

  # @param nodes [String[]] array of syntax elements (no deep hierarchy)
  constructor: (@nodes) ->

  # Return single command string
  getCommand: =>
    @nodes[0]

  # Return list of argument strings, assuming a single command
  getArgs: =>
    @nodes[1]

  toString: =>
    "#{@nodes[0]} -> #{@nodes[1].join ', '}"
