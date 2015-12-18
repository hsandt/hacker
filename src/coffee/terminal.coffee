class @Terminal

  # Construct terminal from div container
  #
  # terminalScreen [jQuery] jQuery element for the terminal-screen div
  constructor: (terminalScreen) ->
    @interpreter = new CommandInterpreter

    @output = []  # [String[]] output lines, including commands entered by the player
    @outputDiv = terminalScreen.find ".output"

    @history = [""]  # [String[]] command history, as a reversed queue, with last buffer as 1st element
    @historyIndex = 0  # [int] current index of command-line history, 0 for current buffer, 1 for previous command, etc.
    @promptInput = terminalScreen.find ".prompt-input"

    @connectionStack = [Game.servers["local"]]  # [Server[]] stack of servers through which you connected, last is current server

    # set initial focus and prevent losing focus by brute-force
    @promptInput.focus()
    @promptInput.blur =>
      @promptInput.focus()

    # bind up/down arrow press to history navigation
    @promptInput.keydown (event) =>
      switch event.which
        when Keycode.UP
          @navigateHistory 1
          false  # stop propagation
        when Keycode.DOWN
          @navigateHistory -1
          false  # stop propagation

    # replace normal submit behavior for prompt
    terminalScreen.find(".prompt-submit").click => @enterCommand @promptInput.val()

  # Navigate in command-line history up or down as much as possible
  #
  # delta [int] 1 to go to next command, -1 to go to previous command
  navigateHistory: (delta) =>
    if @historyIndex > 0 and delta == -1
      console.log "-1"
      --@historyIndex
      @promptInput.val @history[@historyIndex]
    else if @historyIndex < @history.length - 1 and delta == 1
      console.log "+1"
      if @historyIndex == 0
        # if you enter history navigation mode, remember current input for later
        @history[0] = @promptInput.val()
      ++@historyIndex
    else return
    @promptInput.val @history[@historyIndex]

  # Send command to fictive shell
  #
  # command [string] command sent to shell
  enterCommand: (commandLine) =>
    # record command in history
    @history[0] = commandLine
    @history.unshift ""

    # empty input field
    @promptInput.val("")

    # output entered command with prompt symbol (multiple whitespaces will be reduced to one by HTML)
    @print '> ' + commandLine

    # interpret command if you can, else show error message
    try
      syntaxTree = @interpreter.parse commandLine
    catch error
      @print error.message
      return

    try
      # pass the current process to execute the syntax tree (here, the terminal object)
      # so that the child process can print to output, open another interpreter inside, etc.
      @interpreter.execute syntaxTree, @
    catch error
      @print error.message

  # Send a text to the terminal output, on one line
  #
  # lines [String...]
  print: (lines...) =>
    for line in lines
      @outputDiv.append(document.createTextNode(line)).append '<br>'


# Class responsible for syntax analysis (parsing) and execution
# of the command-lines in the terminal
class @CommandInterpreter

  constructor: ->
    # fill command objects with actual instances (we use bound methods for convenience
    # for debug, but static methods would work too)
    @commandObjects =
      "VOID": new VoidCommand
      "HELP": new HelpCommand
      "LS": new LsCommand
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
      throw SyntaxError "#{command} is not a known command."
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

class @HelpCommand extends Command

  # Show available commands information
  execute: (args, terminal) =>
    terminal.print "List of available commands:",
      "help -- show this help menu",
      "ls -- show files and subdirectories in current directory"

  toString: ->
    "HELP command"


class @LsCommand extends Command

  # Show files and subdirectories in current directory
  execute: (args, terminal) =>
    # IMPROVE: get last element of array in coffeescript
    for file in terminal.connectionStack[terminal.connectionStack.length - 1].files
      terminal.print file

  toString: ->
    "LS command"

class @ConnectCommand extends Command

  # Connect to server by domain URL or IP
  execute: (args, terminal) =>
    if args.length < 1
      throw SyntaxError "The connect command requires 1 argument: the domain URL or IP"
    address = args[0]
    terminal.print "Connecting to #{address}..."
    server = Server.find(address)
    if !server?
      terminal.print "Could not resolve hostname / IP #{address}"
      return
    terminal.print "Connected to #{server.mainURL}"  # FIXME: in reality url is not given from IP
    terminal.connectionStack.push server


  toString: ->
    "CONNECT command"

# IMPROVE: use strings instead of "enum" tokens and just use a dictionary to match
# each string to a command object in CommandInterpreter constructor
CommandToken =
  VOID: "VOID"
  HELP: "HELP"
  LS: "LS"
  CONNECT: "CONNECT"

CommandTokenFromString =
  "void": CommandToken.VOID
  "help": CommandToken.HELP
  "ls": CommandToken.LS
  "dir": CommandToken.LS
  "connect": CommandToken.CONNECT