import {Server} from "./server";
import {Keycode} from "./enum";

export class TerminalDevice extends HubDevice {

  // If active is true, show a visual cue to notify the player that something new has happened
  // If active is false, stop showing visual cue for new events
  constructor(...args) {
      super(...args);
      this.notify = this.notify.bind(this);
  }

  notify(state = "on") {
//    if !(state in ["on", "off"])
//      throw Exception "notify 'state' argument must be 'on' or 'off'"
//    antistate = if state == "on" then "off" else "on"

      // change class to trigger notification style / animation
//    @$device.removeClass "notify-#{antistate}"
//    @$device.addClass "notify-#{state}"

      if (state === "on") {
          return console.log("TERMINAL NOTIFY ON");
      }
  }
};


let CommandToken = {
  void: "void",
  clear: "clear",
  help: "help",
  ls: "ls",
  dir: "ls",
  cd: "cd",
  cat: "cat",
  connect: "connect"
};



  export let Terminal = class Terminal extends App {

      openedOnce = false;

      // Construct terminal from div container
      //
      // $screen [jQuery] jQuery element for the terminal-screen div
      constructor($screen, $device) {
          super($screen, $device);
          this.device = new TerminalDevice($device);

          this.interpreter = new CommandInterpreter(this);

          this.output = [];  // [String[]] output lines, including commands entered by the player
          this.$output = $screen.find(".output");

          this.history = [""];  // [String[]] command history, as a reversed queue, with last buffer as 1st element
          this.historyIndex = 0;  // [int] current index of command-line history, 0 for current buffer, 1 for previous command, etc.
          this.$promptInput = $screen.find(".prompt-input");

          this.connectionStack = [];  // [Server[]] stack of servers through which you connected, last is current server
          this.directoryStack = [];  // [Directory[]] stack of directories corresponding to path to working directory

          // connect terminal to local server (will also set working dir to its root)
          this.connect(game.servers["local"]);

          // bind up/down arrow press to history navigation
          this.$promptInput.keydown(event => {
                  switch (event.which) {
                      case Keycode.UP:
                          this.navigateHistory(1);
                          return false;  // stop propagation
                      case Keycode.DOWN:
                          this.navigateHistory(-1);
                          return false;
                  }
              }
          );  // stop propagation

          // replace normal submit behavior for prompt
          $screen.find(".prompt-submit").click(() => this.enterCommand(this.$promptInput.val()));
      }

      // Current server get property
      getPropertyCurrentServer() { return this.connectionStack[this.connectionStack.length - 1]; }

      // Current directory get property
      getPropertyCurrentDirectory() { return this.directoryStack[this.directoryStack.length - 1]; }
  };




export let Terminal = class Terminal extends App {

    openedOnce = false;

    // Construct terminal from div container
    //
    // $screen [jQuery] jQuery element for the terminal-screen div
    constructor($screen, $device) {
        super($screen, $device);
        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.navigateHistory = this.navigateHistory.bind(this);
        this.print = this.print.bind(this);
        this.printHTML = this.printHTML.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.printText = this.printText.bind(this);
        this.connect = this.connect.bind(this);
        this.enterCommand = this.enterCommand.bind(this);
        this.clearCommand = this.clearCommand.bind(this);
        this.helpCommand = this.helpCommand.bind(this);
        this.lsCommand = this.lsCommand.bind(this);
        this.cdCommand = this.cdCommand.bind(this);
        this.catCommand = this.catCommand.bind(this);
        this.connectCommand = this.connectCommand.bind(this);
        this.device = new TerminalDevice($device);

        this.interpreter = new CommandInterpreter(this);

        this.output = [];  // [String[]] output lines, including commands entered by the player
        this.$output = $screen.find(".output");

        this.history = [""];  // [String[]] command history, as a reversed queue, with last buffer as 1st element
        this.historyIndex = 0;  // [int] current index of command-line history, 0 for current buffer, 1 for previous command, etc.
        this.$promptInput = $screen.find(".prompt-input");

        this.connectionStack = [];  // [Server[]] stack of servers through which you connected, last is current server
        this.directoryStack = [];  // [Directory[]] stack of directories corresponding to path to working directory

        // connect terminal to local server (will also set working dir to its root)
        this.connect(game.servers["local"]);

        // bind up/down arrow press to history navigation
        this.$promptInput.keydown(event => {
                switch (event.which) {
                    case Keycode.UP:
                        this.navigateHistory(1);
                        return false;  // stop propagation
                    case Keycode.DOWN:
                        this.navigateHistory(-1);
                        return false;
                }
            }
        );  // stop propagation

        // replace normal submit behavior for prompt
        $screen.find(".prompt-submit").click(() => this.enterCommand(this.$promptInput.val()));
    }

    // Current server get property
    getPropertyCurrentServer() { return this.connectionStack[this.connectionStack.length - 1]; }

    // Current directory get property
    getPropertyCurrentDirectory() { return this.directoryStack[this.directoryStack.length - 1]; }




    /* OPEN/CLOSE */

    // Focus on terminal prompt
    onOpen() {
        if (!this.openedOnce) {
            this.openedOnce = true;
            this.print("Pour voir les commandes de bases, entrez help");
        }

        // set initial focus and prevent losing focus by brute-force
        this.$promptInput.focus();
        return this.$promptInput.on("blur.autofocus", () => {
                return this.$promptInput.focus();
            }
        );
    }

    // Leave focus and unbind forced focus rule
    onClose() {
        this.$promptInput.off("blur.autofocus");
        return this.$promptInput.blur();
    }

    /* INPUT/OUTPUT */

    // Navigate in command-line history up or down as much as possible
    //
    // delta [int] 1 to go to next command, -1 to go to previous command
    navigateHistory(delta) {
        if (this.historyIndex > 0 && delta === -1) {
            console.log("-1");
            --this.historyIndex;
            this.$promptInput.val(this.history[this.historyIndex]);
        } else if (this.historyIndex < this.history.length - 1 && delta === 1) {
            console.log("+1");
            if (this.historyIndex === 0) {
                // if you enter history navigation mode, remember current input for later
                this.history[0] = this.$promptInput.val();
            }
            ++this.historyIndex;
        } else { return; }
        return this.$promptInput.val(this.history[this.historyIndex]);
    }

    // Send a sanitized text to the terminal output, on one line
    //
    // lines [String...]
    print(...lines) {
        return lines.map((line) =>
            this.$output.append(document.createTextNode(line)).append('<br>'));
    }

    // Send a raw text to the terminal output, on one line
    //
    // lines [String...]
    printHTML(...lines) {
        return lines.map((line) =>
            this.$output.append(line).append('<br>'));
    }

    scrollToBottom() {
        // cancel previous animations and start smooth scroll from current position
//    console.log "scroll #{@$output[0].scrollHeight}"
        this.$output.stop();
        return this.$output.animate({scrollTop: this.$output[0].scrollHeight}, 200, "swing");
    }


    /* CORE ACTIONS */

    // Print file content to output and trigger any game event hooked
    //
    // @param [TextFile] text file to read
    printText(textFile) {
        // WARNING: printHTML will print the text content as HTML; use HTML symbols
        // in your text data or make a conversion from JSON strings beforehand!
        this.printHTML(textFile.content.replace(/\n/g, '<br>'));
        // trigger game events related to reading this file
        if (textFile.onReadEvent != null) {
            return game.triggerEvent(textFile.onReadEvent);
        }
    }

    // Connect to a server
    //
    // server [Server] target server
    connect(server) {
        this.connectionStack.push(server);
        // set current working directory to root of this server
        this.directoryStack.length = 0;
        return this.directoryStack.push(this.currentServer.getRoot());
    }



    /* COMMANDS */

    // Send command to fictive shell
    //
    // command [string] command sent to shell
    enterCommand(commandLine) {
        // record entered command in history and reset history position to 0
        this.history[0] = commandLine;
        this.history.unshift("");
        this.historyIndex = 0;

        // empty input field
        this.$promptInput.val("");

        // output entered command with prompt symbol (multiple whitespaces will be reduced to one by HTML)
        this.print(`> ${commandLine}`);

        // interpret command if you can, else show error message
        try {
            var syntaxTree = this.interpreter.parse(commandLine);
        } catch (error) {
            this.print(error.message);
            this.scrollToBottom();
            return;
        }

        try {
            // pass the current process to execute the syntax tree (here, the terminal object)
            // so that the child process can print to output, open another interpreter inside, etc.
            this.interpreter.execute(syntaxTree, this);
        } catch (error) {
            this.print(error.message);
        }

        return this.scrollToBottom();
    }



    // Clear the output content, but keep the input history
    clearCommand() {
        return this.$output.empty();
    }

    // Show available commands information
    helpCommand() {
        return this.print("List of available commands:",
            "clear -- clear the console output",
            "help -- show this help menu",
            "ls -- show files and subdirectories in current directory",
            "cd -- navigate to subdirectory",
            "cat <file> -- print content of text file to console output",
            "connect <domain> -- connect to a domain by URL or IP");
    }

    // Show files and subdirectories in directory at relative path
    //
    // @param pathname [String] relative path with 'a/b' format
    lsCommand(pathname) {
        // IMPROVE: support pathname
        return this.currentDirectory.children.map((file) =>
            this.print(file.toString()));
    }


    // Enter directory at relative path
    //
    // @param pathname [String] relative path with 'a/b' format
    cdCommand(pathname) {
        // on unix, cd with no arguments sends back to the user's home directory; there is no 'root' home dir so let's go to /
        if (pathname == null) {
            var newDirectoryStack = [this.directoryStack[0]];  // only keep ROOT directory (not root home); works if no other ref to this array
        } else {
            let pathChain = pathname.split('/');
            var newDirectoryStack = this.directoryStack.slice();  // work on stack copy in case it fails in the middle
            for (let i = 0; i < pathChain.length; i++) {
                let nextDirName = pathChain[i];
                if (nextDirName === '.' || nextDirName === '') {
                    continue;
                }
                if (nextDirName === '..') {
                    // do not pop if already at ROOT
                    if (newDirectoryStack.length > 1) {
                        newDirectoryStack.pop();
                    }
                } else {
                    // nextDirName is assumed to be a normal name
                    let nextDir = newDirectoryStack[newDirectoryStack.length - 1].getChildDir(nextDirName);
                    // if path cannot be resolved at this step, STOP, no such directory found, do not change directory
                    if (nextDir == null) { throw new Error(`cd: ${pathname}: No such directory`); }
                    newDirectoryStack.push(nextDir);
                }
            }
        }

        return this.directoryStack = newDirectoryStack;  // array ref changes here again
    }

    // Print text file content to output
    //
    // @param filename [String] name of a text file to read
    catCommand(filename) {
        if (filename == null) {
            // unix cat open stream for free input, but we do not need this in the game
            throw new SyntaxError("The cat command requires 1 argument: the name of a text (.txt) file");
        }

        if (filename.slice(-4) === ".txt") {
            // remove .txt extension for the search by name
            filename = filename.slice(0, -4);
        }

        // IMPROVE: support path + filename
        let textFile = this.currentDirectory.getFile(TextFile, filename);
        if (textFile == null) {
            throw new Error(`cat: ${filename}: No such file`);
        }
        return this.printText(textFile);
    }

    // Connect to server by domain URL or IP
    //
    // @param address [String] domain URL or IP address
    connectCommand(address) {
        if (address == null) {
            throw new SyntaxError("The connect command requires 1 argument: the domain URL or IP");
        }
        let server = Server.find(address);
        if (server == null) {
            return this.print(`Could not resolve hostname / IP ${address}`);
        } else {
            this.connect(server);
            return this.print(`Connected to ${address}`);
        }
    }
};


// Class responsible for syntax analysis (parsing) and execution
// of the command-lines in the terminal
let CommandInterpreter$1 = class CommandInterpreter {

    // @param terminal [Terminal] terminal receiving the commands
    constructor(terminal) {
        this.parse = this.parse.bind(this);
        this.execute = this.execute.bind(this);
        this.void = this.void.bind(this);
        this.clear = this.clear.bind(this);
        this.help = this.help.bind(this);
        this.ls = this.ls.bind(this);
        this.cd = this.cd.bind(this);
        this.cat = this.cat.bind(this);
        this.connect = this.connect.bind(this);
        this.terminal = terminal;
    }

    // Parse a command and return a syntax tree made of tokens
    // Throw an exception if a parsing error occurs
    //
    // commandLine [string] command sent to shell
    parse(commandLine) {
        console.log(`[TERMINAL] Parse '${commandLine}'`);
        // multi-word analysis
        // trim whitespaces and separate command from arguments
        let [command, ...commandArgs] = commandLine.trim().split(/\s+/);
        if (command === "") {
            return new SyntaxTree([CommandToken.void, []]);
        }
        if (!(command in CommandToken)) {
            throw SyntaxError(`${command}: command not found`);
        }
        return new SyntaxTree([CommandToken[command], commandArgs]);
    }

    // Execute command with arguments provided in syntax tree
    // All commands interpretation consist in giving semantics to each argument and delegating back to the terminal
    //
    // @param syntaxTree [SyntaxTree] : multi-dimensional array containing the command line tokens
    // @param terminal [Terminal] : represents the parent process
    execute(syntaxTree, terminal) {
        console.log(`[TERMINAL] Execute ${syntaxTree}`);
        return this[syntaxTree.getCommand()](syntaxTree.getArgs());
    }

    // For all methods below, execute command line with following parameters
    //
    // @param args [Terminal] : arguments of the invoked command
    // @param terminal [Terminal] : represents the parent process

    // Do nothing
    void(args) {}

    // Delegate clear command to terminal
    clear(args) {
        return this.terminal.clearCommand();
    }

    // Delegate help command to terminal
    help(args) {
        return this.terminal.helpCommand();
    }

    // Delegate ls command to terminal for given pathname
    ls(args) {
        return this.terminal.lsCommand(args[0]);
    }

    // Delegate cd command to terminal for given pathname
    cd(args) {
        return this.terminal.cdCommand(args[0]);
    }

    // Delegate cat command to terminal for given filenamehu
    cat(args) {
        return this.terminal.catCommand(args[0]);
    }

    // Delegate ls command to terminal for given address
    connect(args) {
        return this.terminal.connectCommand(args[0]);
    }
};
export { CommandInterpreter$1 as CommandInterpreter };



export class SyntaxTree {

    // @param nodes [String[]] array of syntax elements (no deep hierarchy)
    constructor(nodes) {
        this.getCommand = this.getCommand.bind(this);
        this.getArgs = this.getArgs.bind(this);
        this.toString = this.toString.bind(this);
        this.nodes = nodes;
    }

    // Return single command string
    getCommand() {
        return this.nodes[0];
    }

    // Return list of argument strings, assuming a single command
    getArgs() {
        return this.nodes[1];
    }

    toString() {
        return `${this.nodes[0]} -> ${this.nodes[1].join(', ')}`;
    }
};

