class @Terminal

  # Construct terminal from div container
  #
  # terminalScreen [jQuery] jQuery element for the terminal-screen div
  constructor: (terminalScreen) ->
    @interpreter = new CommandInterpreter

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
    # empty input field
    @promptInput.val("")

    # output entered command with prompt symbol
    @print '> ' + command

    # interpret command if you can, else show error message
    try
      syntaxTree = @interpreter.parse command
    catch error
      @print error.message
      return

    # pass the current process to execute the syntax tree (here, the terminal object)
    # so that the child process can print to output, open another interpreter inside, etc.
    @interpreter.execute syntaxTree, @

  # Send a text to the terminal output, on one line
  print: (lines...) =>
    for line in lines
      @outputDiv.append(document.createTextNode(line)).append '<br>'

# Class responsible for syntax analysis (parsing) and execution
# of the command-lines in the terminal
class @CommandInterpreter

  constructor: ->

  # Parse a command and return a syntax tree made of tokens
  # Throw an exception if a parsing error occurs
  #
  # command [string] command sent to shell
  parse: (command) =>
    console.log "[TERMINAL] Parse '#{command}'"
    # one-world analysis
    word = command
    if !(word of CommandStrings)
      throw SyntaxError "#{word} is not a known command."
    CommandStrings[word]

  # Execute commands in syntax tree
  #
  # syntaxTree [SyntaxTree] : for now, just a string
  # terminal [Terminal] : represents the parent process
  execute: (syntaxTree, terminal) =>
    console.log "[TERMINAL] Execute #{syntaxTree}"
    syntaxTree.execute terminal

class @Command

  # [virtual] Behavior of the command on execution
  # terminal [Terminal] : represents the parent process
  execute: (terminal) =>
    throw "#{this} has not implemented the 'execute' method."


class @HelpCommand extends Command

  # Show available commands information
  execute: (terminal) =>
    terminal.print "List of available commands:",
      "help -- show this help menu",
      "ls -- show files and subdirectories in current directory"

  toString: ->
    "HELP command"


class @LsCommand extends Command

  # Show files and subdirectories in current directory
  execute: (terminal) =>
    terminal.print "bin", "etc", "home", "usr"

  toString: ->
    "LS command"


# IMPROVE: initialize this in some function, so that you can put this code
# anywhere not only after the class definitions
Commands =
  HELP: new HelpCommand(),
  LS: new LsCommand()

CommandStrings =
  "help": Commands.HELP,
  "ls": Commands.LS,
  "dir": Commands.LS


#  execute: ->
