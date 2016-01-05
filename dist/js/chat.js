// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  this.ChatDevice = (function(superClass) {
    extend(ChatDevice, superClass);

    function ChatDevice($device) {
      this.notify = bind(this.notify, this);
      ChatDevice.__super__.constructor.call(this, $device);
      $device.addClass("notify-off");
    }

    ChatDevice.prototype.notify = function(state) {
      var antistate, phoneAudio;
      if (state == null) {
        state = "on";
      }
      if (!(state === "on" || state === "off")) {
        throw new Exception("notify 'state' argument must be 'on' or 'off'");
      }
      antistate = state === "on" ? "off" : "on";
      this.$device.removeClass("notify-" + antistate);
      this.$device.addClass("notify-" + state);
      if (state === "on") {
        phoneAudio = new Audio;
        phoneAudio.src = game.audioPath + 'sfx/phone_notification.wav';
        return phoneAudio.play();
      }
    };

    return ChatDevice;

  })(HubDevice);

  this.Chat = (function(superClass) {
    extend(Chat, superClass);

    Chat.prototype.nextIncomingMessageIdx = 0;

    Chat.prototype.appName = "N/A";

    function Chat($screen, $device) {
      this.hideMessageChoices = bind(this.hideMessageChoices, this);
      this.showChoices = bind(this.showChoices, this);
      this.scrollToBottom = bind(this.scrollToBottom, this);
      this.printMessage = bind(this.printMessage, this);
      this.receiveMessage = bind(this.receiveMessage, this);
      this.sendMessage = bind(this.sendMessage, this);
      this.choose = bind(this.choose, this);
      this.enterDialogueNode = bind(this.enterDialogueNode, this);
      this.enterDialogueNodeByName = bind(this.enterDialogueNodeByName, this);
      this.startDialogue = bind(this.startDialogue, this);
      this.startDialogueByName = bind(this.startDialogueByName, this);
      Chat.__super__.constructor.call(this, $screen, $device);
      this.device = new ChatDevice($device);
      this.$chatHistory = $screen.find(".history");
      this.$chatHistoryList = this.$chatHistory.find("ul");
      this.$chatInput = $screen.find(".input");
      this.$chatInputList = this.$chatInput.find("ul");
      this.receivedMessageTemplate = Handlebars.compile($("#message-received-template").html());
      this.sentMessageTemplate = Handlebars.compile($("#message-sent-template").html());
      this.messageChoiceTemplate = Handlebars.compile($("#message-choice-template").html());
      this.dialogueGraph = null;
      this.currentDialogueNode = null;
    }

    Chat.prototype.startDialogueByName = function(dialogueName) {
      return this.startDialogue(game.data.dialogueGraphs[dialogueName]);
    };

    Chat.prototype.startDialogue = function(dialogueGraph) {
      var initialNode;
      this.dialogueGraph = dialogueGraph;
      initialNode = dialogueGraph.getInitialNode();
      return this.enterDialogueNode(initialNode);
    };

    Chat.prototype.enterDialogueNodeByName = function(nodeName) {
      if (nodeName != null) {
        return this.enterDialogueNode(this.dialogueGraph.getNode(nodeName));
      }
    };

    Chat.prototype.enterDialogueNode = function(dialogueNode) {
      this.currentDialogueNode = dialogueNode;
      if (dialogueNode != null) {
        return dialogueNode.onEnter(this);
      } else {
        return this.dialogueGraph = null;
      }
    };

    Chat.prototype.choose = function(choice) {
      return this.enterDialogueNode(choice);
    };

    Chat.prototype.sendMessage = function(message) {
      return this.printMessage(message, this.sentMessageTemplate);
    };

    Chat.prototype.receiveMessage = function(message) {
      if (game.hub.currentAppName !== this.appName) {
        this.device.notify();
      }
      return this.printMessage(message, this.receivedMessageTemplate);
    };

    Chat.prototype.printMessage = function(message, template) {
      var context;
      context = {
        message: message,
        time: "12:00"
      };
      this.$chatHistoryList.append(template(context));
      return this.scrollToBottom();
    };

    Chat.prototype.scrollToBottom = function() {
      return this.$chatHistory.animate({
        scrollTop: this.$chatHistory[0].scrollHeight
      }, 200, "swing");
    };

    Chat.prototype.showChoices = function(choices) {
      return choices.forEach((function(_this) {
        return function(choice) {
          var choiceEntry, localizedLine;
          if (choice == null) {
            throw new Error("Could not find choice node " + choice.name + " in dialogue " + dialogueGraph.name);
          }
          localizedLine = game.locale.getLine(choice.lines[0]);
          choiceEntry = $(_this.messageChoiceTemplate({
            choiceMessage: localizedLine
          }));
          choiceEntry.click(function() {
            return _this.choose(choice);
          });
          return _this.$chatInputList.append(choiceEntry);
        };
      })(this));
    };

    Chat.prototype.hideMessageChoices = function() {
      return this.$chatInputList.empty();
    };

    return Chat;

  })(App);

  this.DialogueGraph = (function() {
    function DialogueGraph(name1, nodes, initialNodeName) {
      this.name = name1;
      this.nodes = nodes != null ? nodes : {};
      this.initialNodeName = initialNodeName != null ? initialNodeName : "initial";
      this.toString = bind(this.toString, this);
      this.getNode = bind(this.getNode, this);
      this.getInitialNode = bind(this.getInitialNode, this);
      this.addNode = bind(this.addNode, this);
    }

    DialogueGraph.prototype.addNode = function(node) {
      return this.nodes[node.name] = node;
    };

    DialogueGraph.prototype.getInitialNode = function() {
      return this.nodes[this.initialNodeName];
    };

    DialogueGraph.prototype.getNode = function(name) {
      if (!(name in this.nodes)) {
        console.warn("[DIALOGUE] Node " + name + " not found");
        return null;
      }
      return this.nodes[name];
    };

    DialogueGraph.prototype.toString = function() {
      return "DialogueGraph " + this.name;
    };

    return DialogueGraph;

  })();

  this.DialogueNode = (function() {
    function DialogueNode(name1, type) {
      this.name = name1;
      this.type = type;
      this.onEnter = bind(this.onEnter, this);
    }

    DialogueNode.prototype.onEnter = function(chat) {
      throw new Error("onEnter is not defined for an abstract DialogueNode");
    };

    return DialogueNode;

  })();

  this.DialogueText = (function(superClass) {
    extend(DialogueText, superClass);

    function DialogueText(name, lines, successor) {
      this.lines = lines;
      this.successor = successor;
      this.onEnter = bind(this.onEnter, this);
      this.toString = bind(this.toString, this);
      DialogueText.__super__.constructor.call(this, name, "text");
    }

    DialogueText.prototype.toString = function() {
      return "DialogueText " + this.name + " -> " + (this.successor != null ? this.successor.name : "END");
    };

    DialogueText.prototype.onEnter = function(chat) {
      var i, len, lineID, ref;
      ref = this.lines;
      for (i = 0, len = ref.length; i < len; i++) {
        lineID = ref[i];
        chat.receiveMessage(game.locale.getLine(lineID));
      }
      return chat.enterDialogueNode(this.successor);
    };

    return DialogueText;

  })(DialogueNode);

  this.DialogueChoiceHub = (function(superClass) {
    extend(DialogueChoiceHub, superClass);

    function DialogueChoiceHub(name, choices1) {
      this.choices = choices1;
      this.onEnter = bind(this.onEnter, this);
      this.toString = bind(this.toString, this);
      DialogueChoiceHub.__super__.constructor.call(this, name, "choice hub");
    }

    DialogueChoiceHub.prototype.toString = function() {
      return "DialogueChoiceHub " + this.name + " -> " + (this.choices.map(function(e) {
        return e.name;
      }).join(", "));
    };

    DialogueChoiceHub.prototype.onEnter = function(chat) {
      return chat.showChoices(this.choices);
    };

    return DialogueChoiceHub;

  })(DialogueNode);

  this.DialogueChoice = (function(superClass) {
    extend(DialogueChoice, superClass);

    function DialogueChoice(name, lines, successor) {
      this.lines = lines;
      this.successor = successor;
      this.onEnter = bind(this.onEnter, this);
      this.toString = bind(this.toString, this);
      DialogueChoice.__super__.constructor.call(this, name, "choice");
    }

    DialogueChoice.prototype.toString = function() {
      return "DialogueChoice " + this.name + " '" + (this.lines.join("; ")) + "' -> " + (this.successor != null ? this.successor.name : "END");
    };

    DialogueChoice.prototype.onEnter = function(chat) {
      var i, len, lineID, ref;
      chat.hideMessageChoices();
      ref = this.lines;
      for (i = 0, len = ref.length; i < len; i++) {
        lineID = ref[i];
        chat.sendMessage(game.locale.getLine(lineID));
      }
      return chat.enterDialogueNode(this.successor);
    };

    return DialogueChoice;

  })(DialogueNode);

  this.DialogueEvent = (function(superClass) {
    extend(DialogueEvent, superClass);

    function DialogueEvent(name, eventFunction, successor) {
      this.eventFunction = eventFunction;
      this.successor = successor;
      this.onEnter = bind(this.onEnter, this);
      this.toString = bind(this.toString, this);
      DialogueEvent.__super__.constructor.call(this, name, "event");
    }

    DialogueEvent.prototype.toString = function() {
      return "DialogueEvent " + this.name + " -> " + (this.successor != null ? this.successor.name : "END");
    };

    DialogueEvent.prototype.onEnter = function(chat) {
      this.eventFunction();
      return chat.enterDialogueNode(this.successor);
    };

    return DialogueEvent;

  })(DialogueNode);

  this.DialogueWait = (function(superClass) {
    extend(DialogueWait, superClass);

    function DialogueWait(name, waitTime, successor) {
      this.waitTime = waitTime;
      this.successor = successor;
      this.onEnter = bind(this.onEnter, this);
      this.toString = bind(this.toString, this);
      DialogueWait.__super__.constructor.call(this, name, "wait");
    }

    DialogueWait.prototype.toString = function() {
      return "DialogueWait " + this.name + " (" + this.waitTime + " ms) -> " + (this.successor != null ? this.successor.name : "END");
    };

    DialogueWait.prototype.onEnter = function(chat) {
      console.log(this.waitTime);
      return setTimeout(((function(_this) {
        return function() {
          return chat.enterDialogueNode(_this.successor);
        };
      })(this)), this.waitTime);
    };

    return DialogueWait;

  })(DialogueNode);

  this.Phone = (function(superClass) {
    extend(Phone, superClass);

    function Phone() {
      return Phone.__super__.constructor.apply(this, arguments);
    }

    Phone.prototype.appName = "phone";

    return Phone;

  })(Chat);

}).call(this);

//# sourceMappingURL=chat.js.map