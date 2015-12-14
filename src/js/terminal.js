// Generated by CoffeeScript 1.10.0
(function() {
  var CommandStrings, Commands,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  this.Terminal = (function() {
    function Terminal(terminalScreen) {
      this.print = bind(this.print, this);
      this.enterCommand = bind(this.enterCommand, this);
      this.interpreter = new CommandInterpreter;
      this.output = [];
      this.outputDiv = terminalScreen.find(".output");
      this.history = [];
      this.promptInput = terminalScreen.find(".prompt-input");
      this.promptInput.focus();
      this.promptInput.blur((function(_this) {
        return function() {
          return _this.promptInput.focus();
        };
      })(this));
      terminalScreen.find(".prompt-submit").click((function(_this) {
        return function() {
          return _this.enterCommand(_this.promptInput.val());
        };
      })(this));
    }

    Terminal.prototype.enterCommand = function(command) {
      var error, error1, error2, syntaxTree;
      this.promptInput.val("");
      this.print('> ' + command);
      try {
        syntaxTree = this.interpreter.parse(command);
      } catch (error1) {
        error = error1;
        this.print(error.message);
        return;
      }
      try {
        return this.interpreter.execute(syntaxTree, this);
      } catch (error2) {
        error = error2;
        return this.print(error.message);
      }
    };

    Terminal.prototype.print = function() {
      var i, len, line, lines, results;
      lines = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      results = [];
      for (i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        results.push(this.outputDiv.append(document.createTextNode(line)).append('<br>'));
      }
      return results;
    };

    return Terminal;

  })();

  this.CommandInterpreter = (function() {
    function CommandInterpreter() {
      this.execute = bind(this.execute, this);
      this.parse = bind(this.parse, this);
      this.commandObjects = {};
      this.commandObjects[Commands.HELP] = new HelpCommand;
      this.commandObjects[Commands.LS] = new LsCommand;
      this.commandObjects[Commands.CONNECT] = new ConnectCommand;
    }

    CommandInterpreter.prototype.parse = function(commandLine) {
      var command, commandArgs, words;
      console.log("[TERMINAL] Parse '" + commandLine + "'");
      words = commandLine.trim().split(' ');
      command = words[0];
      commandArgs = words.slice(1);
      if (!(command in CommandStrings)) {
        throw SyntaxError(command + " is not a known command.");
      }
      return new SyntaxTree([CommandStrings[command], commandArgs]);
    };

    CommandInterpreter.prototype.execute = function(syntaxTree, terminal) {
      console.log("[TERMINAL] Execute " + syntaxTree);
      console.log(this.commandObjects["help"]);
      console.log;
      return this.commandObjects[syntaxTree.getCommand()].execute(syntaxTree.getArgs(), terminal);
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
      return this.nodes[0] + " -> " + this.nodes[1].length;
    };

    return SyntaxTree;

  })();

  this.Command = (function() {
    function Command() {
      this.execute = bind(this.execute, this);
    }

    Command.prototype.execute = function(args, terminal) {
      throw this + " has not implemented the 'execute' method.";
    };

    return Command;

  })();

  this.HelpCommand = (function(superClass) {
    extend(HelpCommand, superClass);

    function HelpCommand() {
      this.execute = bind(this.execute, this);
      return HelpCommand.__super__.constructor.apply(this, arguments);
    }

    HelpCommand.prototype.execute = function(args, terminal) {
      return terminal.print("List of available commands:", "help -- show this help menu", "ls -- show files and subdirectories in current directory");
    };

    HelpCommand.prototype.toString = function() {
      return "HELP command";
    };

    return HelpCommand;

  })(Command);

  this.LsCommand = (function(superClass) {
    extend(LsCommand, superClass);

    function LsCommand() {
      this.execute = bind(this.execute, this);
      return LsCommand.__super__.constructor.apply(this, arguments);
    }

    LsCommand.prototype.execute = function(args, terminal) {
      return terminal.print("bin", "etc", "home", "usr");
    };

    LsCommand.prototype.toString = function() {
      return "LS command";
    };

    return LsCommand;

  })(Command);

  this.ConnectCommand = (function(superClass) {
    extend(ConnectCommand, superClass);

    function ConnectCommand() {
      this.execute = bind(this.execute, this);
      return ConnectCommand.__super__.constructor.apply(this, arguments);
    }

    ConnectCommand.prototype.execute = function(args, terminal) {
      if (args.length < 1) {
        throw SyntaxError("The connect command required 1 argument: the domain URL or IP");
      }
      return terminal.print("Connecting to " + args[0] + ",,,");
    };

    ConnectCommand.prototype.toString = function() {
      return "CONNECT command";
    };

    return ConnectCommand;

  })(Command);

  Commands = {
    HELP: "help",
    LS: "ls",
    CONNECT: "connect"
  };

  CommandStrings = {
    "help": Commands.HELP,
    "ls": Commands.LS,
    "dir": Commands.LS,
    "connect": Commands.CONNECT
  };

}).call(this);

//# sourceMappingURL=terminal.js.map
