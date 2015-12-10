// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Chat = (function() {
    Chat.incomingMessageSequence = ["Hi!", "How are you?", "Is everything alright?"];

    Chat.prototype.nextIncomingMessageIdx = 0;

    function Chat(chatScreen) {
      this.receiveAllMessages = bind(this.receiveAllMessages, this);
      this.receiveNextMessage = bind(this.receiveNextMessage, this);
      this.hideMessageChoices = bind(this.hideMessageChoices, this);
      this.showMessageChoices = bind(this.showMessageChoices, this);
      this.scrollToBottom = bind(this.scrollToBottom, this);
      this.sendMessage = bind(this.sendMessage, this);
      this.receiveMessage = bind(this.receiveMessage, this);
      this.enterDialogueNode = bind(this.enterDialogueNode, this);
      this.startDialogue = bind(this.startDialogue, this);
      this.chatHistory = chatScreen.find(".chat-history");
      this.chatHistoryList = this.chatHistory.find("ul");
      this.chatInput = chatScreen.find(".chat-input");
      this.chatInputList = this.chatInput.find("ul");
      this.receivedMessageTemplate = Handlebars.compile($("#message-received-template").html());
      this.sentMessageTemplate = Handlebars.compile($("#message-sent-template").html());
      this.messageChoiceTemplate = Handlebars.compile($("#message-choice-template").html());
      this.dialogueGraph = null;
      this.currentDialogueNode = null;
    }

    Chat.prototype.startDialogue = function(dialogueGraph) {
      this.dialogueGraph = dialogueGraph;
      return this.enterDialogueNode(dialogueGraph.getInitialNode());
    };

    Chat.prototype.enterDialogueNode = function(dialogueNode) {
      var i, len, message, ref;
      this.currentDialogueNode = dialogueNode;
      ref = dialogueNode.messages;
      for (i = 0, len = ref.length; i < len; i++) {
        message = ref[i];
        this.receiveMessage(message);
      }
      return this.showMessageChoices(dialogueNode.choices);
    };

    Chat.prototype.receiveMessage = function(message) {
      var context;
      context = {
        message: message,
        time: "12:00"
      };
      this.chatHistoryList.append(this.receivedMessageTemplate(context));
      return this.scrollToBottom();
    };

    Chat.prototype.sendMessage = function(choice) {
      this.hideMessageChoices();
      this.chatHistoryList.append(this.sentMessageTemplate({
        message: choice.message
      }));
      this.scrollToBottom();
      return this.enterDialogueNode(this.dialogueGraph.getNode(choice.nextNodeId));
    };

    Chat.prototype.scrollToBottom = function() {
      return this.chatHistory.animate({
        scrollTop: this.chatHistory[0].scrollHeight
      }, 200, "swing");
    };

    Chat.prototype.showMessageChoices = function(choices) {
      return choices.forEach((function(_this) {
        return function(choice) {
          var choiceEntry;
          choiceEntry = $(_this.messageChoiceTemplate({
            choiceMessage: choice.message
          }));
          choiceEntry.click(function() {
            return _this.sendMessage(choice);
          });
          return _this.chatInputList.append(choiceEntry);
        };
      })(this));
    };

    Chat.prototype.hideMessageChoices = function() {
      return this.chatInputList.empty();
    };

    Chat.prototype.receiveNextMessage = function() {
      var context, template;
      template = Handlebars.compile($("#message-received-template").html());
      context = {
        message: Chat.incomingMessageSequence[this.nextIncomingMessageIdx],
        time: "12:00"
      };
      this.chatHistoryList.append(template(context));
      this.scrollToBottom();
      return ++this.nextIncomingMessageIdx;
    };

    Chat.prototype.receiveAllMessages = function(nbMessages, timeInterval) {
      if (nbMessages === 0) {
        return;
      }
      this.receiveNextMessage();
      return setTimeout(((function(_this) {
        return function() {
          return _this.receiveAllMessages(nbMessages - 1, timeInterval);
        };
      })(this)), timeInterval);
    };

    return Chat;

  })();

  this.DialogueGraph = (function() {
    function DialogueGraph(nodes, initialNodeId) {
      this.nodes = nodes != null ? nodes : {};
      this.initialNodeId = initialNodeId != null ? initialNodeId : 0;
      this.getNode = bind(this.getNode, this);
      this.getInitialNode = bind(this.getInitialNode, this);
      this.addNode = bind(this.addNode, this);
    }

    DialogueGraph.prototype.addNode = function(node) {
      return this.nodes[node.id] = node;
    };

    DialogueGraph.prototype.getInitialNode = function() {
      return this.nodes[this.initialNodeId];
    };

    DialogueGraph.prototype.getNode = function(id) {
      if (!(id in this.nodes)) {
        throw "Node " + id + " is not in the dialogue graph";
      }
      return this.nodes[id];
    };

    return DialogueGraph;

  })();

  this.DialogueNode = (function() {
    function DialogueNode(id1, messages, choices1) {
      this.id = id1;
      this.messages = messages;
      this.choices = choices1;
    }

    return DialogueNode;

  })();

  this.DialogueChoice = (function() {
    function DialogueChoice(idx, message1, nextNodeId) {
      this.idx = idx;
      this.message = message1;
      this.nextNodeId = nextNodeId;
    }

    return DialogueChoice;

  })();

}).call(this);

//# sourceMappingURL=chat.js.map
