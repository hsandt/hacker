// Generated by CoffeeScript 1.10.0
(function() {
  var CommandToken,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  this.TerminalDevice = (function(superClass) {
    extend(TerminalDevice, superClass);

    function TerminalDevice() {
      this.notify = bind(this.notify, this);
      return TerminalDevice.__super__.constructor.apply(this, arguments);
    }

    TerminalDevice.prototype.notify = function(state) {
      if (state == null) {
        state = "on";
      }
      if (state === "on") {
        return console.log("TERMINAL NOTIFY ON");
      }
    };

    return TerminalDevice;

  })(HubDevice);

  CommandToken = {
    "void": "void",
    clear: "clear",
    help: "help",
    ls: "ls",
    dir: "ls",
    cd: "cd",
    cat: "cat",
    connect: "connect"
  };

  this.Terminal = (function(superClass) {
    extend(Terminal, superClass);

    Terminal.prototype.openedOnce = false;

    function Terminal($screen, $device) {
      this.connectCommand = bind(this.connectCommand, this);
      this.catCommand = bind(this.catCommand, this);
      this.cdCommand = bind(this.cdCommand, this);
      this.lsCommand = bind(this.lsCommand, this);
      this.helpCommand = bind(this.helpCommand, this);
      this.clearCommand = bind(this.clearCommand, this);
      this.enterCommand = bind(this.enterCommand, this);
      this.connect = bind(this.connect, this);
      this.printText = bind(this.printText, this);
      this.scrollToBottom = bind(this.scrollToBottom, this);
      this.printHTML = bind(this.printHTML, this);
      this.print = bind(this.print, this);
      this.navigateHistory = bind(this.navigateHistory, this);
      this.onClose = bind(this.onClose, this);
      this.onOpen = bind(this.onOpen, this);
      Terminal.__super__.constructor.call(this, $screen, $device);
      this.device = new TerminalDevice($device);
      this.interpreter = new CommandInterpreter(this);
      this.output = [];
      this.$output = $screen.find(".output");
      this.history = [""];
      this.historyIndex = 0;
      this.$promptInput = $screen.find(".prompt-input");
      this.connectionStack = [];
      this.directoryStack = [];
      this.connect(game.servers["local"]);
      this.$promptInput.keydown((function(_this) {
        return function(event) {
          switch (event.which) {
            case Keycode.UP:
              _this.navigateHistory(1);
              return false;
            case Keycode.DOWN:
              _this.navigateHistory(-1);
              return false;
          }
        };
      })(this));
      $screen.find(".prompt-submit").click((function(_this) {
        return function() {
          return _this.enterCommand(_this.$promptInput.val());
        };
      })(this));
    }

    Terminal.getter('currentServer', function() {
      return this.connectionStack[this.connectionStack.length - 1];
    });

    Terminal.getter('currentDirectory', function() {
      return this.directoryStack[this.directoryStack.length - 1];
    });


    /* OPEN/CLOSE */

    Terminal.prototype.onOpen = function() {
      if (!this.openedOnce) {
        this.openedOnce = true;
        this.print("Pour voir les commandes de bases, entrez help");
      }
      this.$promptInput.focus();
      return this.$promptInput.on("blur.autofocus", (function(_this) {
        return function() {
          return _this.$promptInput.focus();
        };
      })(this));
    };

    Terminal.prototype.onClose = function() {
      this.$promptInput.off("blur.autofocus");
      return this.$promptInput.blur();
    };


    /* INPUT/OUTPUT */

    Terminal.prototype.navigateHistory = function(delta) {
      if (this.historyIndex > 0 && delta === -1) {
        console.log("-1");
        --this.historyIndex;
        this.$promptInput.val(this.history[this.historyIndex]);
      } else if (this.historyIndex < this.history.length - 1 && delta === 1) {
        console.log("+1");
        if (this.historyIndex === 0) {
          this.history[0] = this.$promptInput.val();
        }
        ++this.historyIndex;
      } else {
        return;
      }
      return this.$promptInput.val(this.history[this.historyIndex]);
    };

    Terminal.prototype.print = function() {
      var i, len, line, lines, results;
      lines = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      results = [];
      for (i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        results.push(this.$output.append(document.createTextNode(line)).append('<br>'));
      }
      return results;
    };

    Terminal.prototype.printHTML = function() {
      var i, len, line, lines, results;
      lines = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      results = [];
      for (i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        results.push(this.$output.append(line).append('<br>'));
      }
      return results;
    };

    Terminal.prototype.scrollToBottom = function() {
      this.$output.stop();
      return this.$output.animate({
        scrollTop: this.$output[0].scrollHeight
      }, 200, "swing");
    };


    /* CORE ACTIONS */

    Terminal.prototype.printText = function(textFile) {
      this.printHTML(textFile.content.replace(/\n/g, '<br>'));
      if (textFile.onReadEvent != null) {
        return game.triggerEvent(textFile.onReadEvent);
      }
    };

    Terminal.prototype.connect = function(server) {
      this.connectionStack.push(server);
      this.directoryStack.length = 0;
      return this.directoryStack.push(this.currentServer.getRoot());
    };


    /* COMMANDS */

    Terminal.prototype.enterCommand = function(commandLine) {
      var error, error1, error2, syntaxTree;
      this.history[0] = commandLine;
      this.history.unshift("");
      this.historyIndex = 0;
      this.$promptInput.val("");
      this.print('> ' + commandLine);
      try {
        syntaxTree = this.interpreter.parse(commandLine);
      } catch (error1) {
        error = error1;
        this.print(error.message);
        this.scrollToBottom();
        return;
      }
      try {
        this.interpreter.execute(syntaxTree, this);
      } catch (error2) {
        error = error2;
        this.print(error.message);
      }
      return this.scrollToBottom();
    };

    Terminal.prototype.clearCommand = function() {
      return this.$output.empty();
    };

    Terminal.prototype.helpCommand = function() {
      return this.print("List of available commands:", "clear -- clear the console output", "help -- show this help menu", "ls -- show files and subdirectories in current directory", "cd -- navigate to subdirectory", "cat <file> -- print content of text file to console output", "connect <domain> -- connect to a domain by URL or IP");
    };

    Terminal.prototype.lsCommand = function(pathname) {
      var file, i, len, ref, results;
      ref = this.currentDirectory.children;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        results.push(this.print(file.toString()));
      }
      return results;
    };

    Terminal.prototype.cdCommand = function(pathname) {
      var i, len, newDirectoryStack, nextDir, nextDirName, pathChain;
      if (pathname == null) {
        newDirectoryStack = [this.directoryStack[0]];
      } else {
        pathChain = pathname.split('/');
        newDirectoryStack = this.directoryStack.slice(0);
        for (i = 0, len = pathChain.length; i < len; i++) {
          nextDirName = pathChain[i];
          if (nextDirName === '.' || nextDirName === '') {
            continue;
          }
          if (nextDirName === '..') {
            if (newDirectoryStack.length > 1) {
              newDirectoryStack.pop();
            }
          } else {
            nextDir = newDirectoryStack[newDirectoryStack.length - 1].getChildDir(nextDirName);
            if (nextDir == null) {
              throw new Error("cd: " + pathname + ": No such directory");
            }
            newDirectoryStack.push(nextDir);
          }
        }
      }
      return this.directoryStack = newDirectoryStack;
    };

    Terminal.prototype.catCommand = function(filename) {
      var textFile;
      if (filename == null) {
        throw new SyntaxError("The cat command requires 1 argument: the name of a text (.txt) file");
      }
      if (filename.slice(-4) === ".txt") {
        filename = filename.slice(0, -4);
      }
      textFile = this.currentDirectory.getFile(TextFile, filename);
      if (textFile == null) {
        throw new Error("cat: " + filename + ": No such file");
      }
      return this.printText(textFile);
    };

    Terminal.prototype.connectCommand = function(address) {
      var server;
      if (address == null) {
        throw new SyntaxError("The connect command requires 1 argument: the domain URL or IP");
      }
      server = Server.find(address);
      if (server == null) {
        return this.print("Could not resolve hostname / IP " + address);
      } else {
        this.connect(server);
        return this.print("Connected to " + address);
      }
    };

    return Terminal;

  })(App);

  this.CommandInterpreter = (function() {
    function CommandInterpreter(terminal1) {
      this.terminal = terminal1;
      this.connect = bind(this.connect, this);
      this.cat = bind(this.cat, this);
      this.cd = bind(this.cd, this);
      this.ls = bind(this.ls, this);
      this.help = bind(this.help, this);
      this.clear = bind(this.clear, this);
      this["void"] = bind(this["void"], this);
      this.execute = bind(this.execute, this);
      this.parse = bind(this.parse, this);
    }

    CommandInterpreter.prototype.parse = function(commandLine) {
      var command, commandArgs, ref;
      console.log("[TERMINAL] Parse '" + commandLine + "'");
      ref = commandLine.trim().split(/\s+/), command = ref[0], commandArgs = 2 <= ref.length ? slice.call(ref, 1) : [];
      if (command === "") {
        return new SyntaxTree([CommandToken["void"], []]);
      }
      if (!(command in CommandToken)) {
        throw SyntaxError(command + ": command not found");
      }
      return new SyntaxTree([CommandToken[command], commandArgs]);
    };

    CommandInterpreter.prototype.execute = function(syntaxTree, terminal) {
      console.log("[TERMINAL] Execute " + syntaxTree);
      return this[syntaxTree.getCommand()](syntaxTree.getArgs());
    };

    CommandInterpreter.prototype["void"] = function(args) {};

    CommandInterpreter.prototype.clear = function(args) {
      return this.terminal.clearCommand();
    };

    CommandInterpreter.prototype.help = function(args) {
      return this.terminal.helpCommand();
    };

    CommandInterpreter.prototype.ls = function(args) {
      return this.terminal.lsCommand(args[0]);
    };

    CommandInterpreter.prototype.cd = function(args) {
      return this.terminal.cdCommand(args[0]);
    };

    CommandInterpreter.prototype.cat = function(args) {
      return this.terminal.catCommand(args[0]);
    };

    CommandInterpreter.prototype.connect = function(args) {
      return this.terminal.connectCommand(args[0]);
    };

    return CommandInterpreter;

  })();

  this.SyntaxTree = (function() {
    function SyntaxTree(nodes) {
      this.nodes = nodes;
      this.toString = bind(this.toString, this);
      this.getArgs = bind(this.getArgs, this);
      this.getCommand = bind(this.getCommand, this);
    }

    SyntaxTree.prototype.getCommand = function() {
      return this.nodes[0];
    };

    SyntaxTree.prototype.getArgs = function() {
      return this.nodes[1];
    };

    SyntaxTree.prototype.toString = function() {
      return this.nodes[0] + " -> " + (this.nodes[1].join(', '));
    };

    return SyntaxTree;

  })();

}).call(this);

//# sourceMappingURL=terminal.js.map
