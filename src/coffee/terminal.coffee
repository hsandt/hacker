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

# IMPROVE: use strings instead of "enum" tokens and just use a dictionary to match
# each string to a command object in CommandInterpreter constructor
CommandToken =
    VOID: "VOID"
    CLEAR: "CLEAR"
    HELP: "HELP"
    LS: "LS"
    CD: "CD"
    CAT: "CAT"
    CONNECT: "CONNECT"

CommandTokenFromString =
    "void": CommandToken.VOID
    "clear": CommandToken.CLEAR
    "help": CommandToken.HELP
    "ls": CommandToken.LS
    "dir": CommandToken.LS
    "cd": CommandToken.CD
    "cat": CommandToken.CAT
    "connect": CommandToken.CONNECT


class @Terminal extends App

  # Construct terminal from div container
  #
  # terminalScreen [jQuery] jQuery element for the terminal-screen div
  constructor: ($screen, $device) ->
    super $screen, $device
    @device = new TerminalDevice $device

    @interpreter = new CommandInterpreter

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

  # Focus on terminal prompt
  onOpen: =>
    # set initial focus and prevent losing focus by brute-force
    @$promptInput.focus()
    @$promptInput.on "blur.autofocus", =>
      @$promptInput.focus()

  # Leave focus and unbind forced focus rule
  onClose: =>
    @$promptInput.off("blur.autofocus")
    @$promptInput.blur()

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

  # Send a sanitized text to the terminal output, on one line
  #
  # lines [String...]
  print: (lines...) =>
    for line in lines
      @$output.append(document.createTextNode(line)).append '<br>'

  # Send a raw text to the terminal output, on one line
  #
  # lines [String...]
  printRaw: (lines...) =>
    for line in lines
      @$output.append(line).append '<br>'

  scrollToBottom: =>
    console.log "scroll #{@$screen[0].scrollHeight}"
    @$output.animate scrollTop: @$screen[0].scrollHeight, 200, "swing"

  # Connect to a server
  #
  # server [Server] target server
  connect: (server) =>
    @connectionStack.push server
    # set current working directory to root of this server
    @directoryStack.length = 0
    @cdChild @currentServer.getRoot()

  # Current server get property
  @getter 'currentServer', -> @connectionStack[@connectionStack.length - 1]

  # Change to child directory
  # Use it to change dir to root only at server connection time
  #
  # dir [Directory] target child directory
  cdChild: (dir) =>
    @directoryStack.push dir

  # Current directory get property
  @getter 'currentDirectory', -> @directoryStack[@directoryStack.length - 1]


# Class responsible for syntax analysis (parsing) and execution
# of the command-lines in the terminal
class @CommandInterpreter

  constructor: ->
    # fill command objects with actual instances (we use bound methods for convenience
    # for debug, but static methods would work too)
    @commandObjects =
      "VOID": new VoidCommand
      "CLEAR": new ClearCommand
      "HELP": new HelpCommand
      "LS": new LsCommand
      "CD": new CdCommand
      "CAT": new CatCommand
      "CONNECT": new ConnectCommand

  # Parse a command and return a syntax tree made of tokens
  # Throw an exception if a parsing error occurs
  #
  # commandLine [string] command sent to shell
  parse: (commandLine) =>
    console.log "[TERMINAL] Parse '#{commandLine}'"
    # multi-word analysis
    # trim whitespaces and separate command from arguments
    console.log(commandLine)
    [command, commandArgs...] = commandLine.trim().split(/\s+/)
    if command == ""
      return new SyntaxTree [CommandToken.VOID, []]
    if !(command of CommandTokenFromString)
      throw SyntaxError "#{command}: command not found"
    new SyntaxTree [CommandTokenFromString[command], commandArgs]

  # Execute command with arguments provided in syntax tree
  #
  # syntaxTree [SyntaxTree] : multi-dimensional array containing the command line tokens
  # terminal [Terminal] : represents the parent process
  execute: (syntaxTree, terminal) =>
    console.log "[TERMINAL] Execute #{syntaxTree}"
    @commandObjects[syntaxTree.getCommand()].execute syntaxTree.getArgs(), terminal

class @SyntaxTree

  # nodes [string[]] array of syntax elements (no deep hierarchy)
  constructor: (@nodes) ->

  # Return single command string
  getCommand: =>
    @nodes[0]

  # Return list of argument strings, assuming a single command
  getArgs: =>
    @nodes[1]

  toString: =>
    "#{@nodes[0]} -> #{@nodes[1].join ', '}"

class @Command

  # (virtual) Behavior of the command on execution
  #
  # args [Terminal] : arguments of the invoked command
  # terminal [Terminal] : represents the parent process
  execute: (args, terminal) =>
    throw "#{this} has not implemented the 'execute' method."

class @VoidCommand extends Command

  # do nothing
  execute: (args, terminal) =>

  toString: ->
    "VOID command"


class @ClearCommand extends Command

  # Clear the output content, but keep the history
  execute: (args, terminal) =>
    terminal.$output.empty()

  toString: ->
    "CLEAR command"


class @HelpCommand extends Command

  # Show available commands information
  execute: (args, terminal) =>
    terminal.print "List of available commands:",
      "clear -- clear the console output",
      "help -- show this help menu",
      "ls -- show files and subdirectories in current directory",
      "cd -- navigate to subdirectory",
      "cat <file> -- print content of text file to console output",
      "connect <domain> -- connect to a domain by URL or IP",

  toString: ->
    "HELP command"


class @LsCommand extends Command

  # Show files and subdirectories in current directory
  execute: (args, terminal) =>
    if terminal.connectionStack.length == 0
      terminal.print "[DEBUG] You are not connected to any server."
      return
    for file in terminal.currentDirectory.children
      terminal.print file.toString()

  toString: ->
    "LS command"

class @CdCommand extends Command

  # Enter target directory
  # Only supports one directory change for now
  execute: (args, terminal) =>
    if args.length < 1
      # on unix, cd without arguments does nothing with no errors
      return

    if terminal.connectionStack.length == 0
      terminal.print "[DEBUG] You are not connected to any server."
      return

    newDirectoryName = args[0]

    childDir = terminal.currentDirectory.getChildDir newDirectoryName
    if !childDir?
      throw new Error "cd: #{newDirectoryName}: No such directory"
    terminal.cdChild childDir

  toString: ->
    "CD command"

class @CatCommand extends Command

  # Print text file content to output
  execute: (args, terminal) =>
    if args.length < 1
      # actual cat open stream for free input, but we do not need this in the game
      throw new SyntaxError "The cat command requires 1 argument: the name of a text (.txt) file"

    textFileName = args[0]
    if textFileName[-4..] == ".txt"
      # remove .txt extension for the search by name
      textFileName = textFileName[0...-4]

    textFile = terminal.currentDirectory.getFile TextFile, textFileName
    if !textFile?
      throw new Error "cat: #{textFileName}: No such file"
    # WARNING: print raw will print the text content as HTML; use HTML symbols
    # in your text data or make a conversion from JSON strings beforehand!
    terminal.printRaw textFile.content.replace /\n/g, '<br>'

  toString: ->
    "CD command"

class @ConnectCommand extends Command

  # Connect to server by domain URL or IP
  execute: (args, terminal) =>
    if args.length < 1
      throw new SyntaxError "The connect command requires 1 argument: the domain URL or IP"
    address = args[0]
    terminal.print "Connecting to #{address}..."
    server = Server.find(address)
    if !server?
      terminal.print "Could not resolve hostname / IP #{address}"
      return
    terminal.print "Connection complete"
    terminal.connect server

  toString: ->
    "CONNECT command"
