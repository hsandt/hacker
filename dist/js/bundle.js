/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(4);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(8);
	__webpack_require__(9);
	__webpack_require__(17);
	__webpack_require__(11);
	__webpack_require__(3);
	__webpack_require__(14);
	__webpack_require__(18);
	__webpack_require__(5);
	__webpack_require__(16);
	__webpack_require__(13);
	__webpack_require__(15);
	__webpack_require__(10);
	module.exports = __webpack_require__(12);


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// Base class for window applications inside the game
	// REFACTOR: split app model and app screen behavior in 2 classes
	// App model contains all basic data and "blind" methods and can be initialized immediately
	// App screen behavior uses takes care of jQuery binding stuff and is initialized
	// after deferred app module HTML is done
	// For instance, Locale could be loaded from language settings immediately,
	// without having to wait for the settings window to be loaded
	exports.default = class {
	
	    // $screen [jQuery] modular window screen element
	    constructor($screen) {
	        this.$screen = $screen;
	        // [String] Lower case app identifier, used to differentiate subclasses such as "phone" vs "irc"
	        this.appName = "N/A";
	        // [HubDevice] hub device
	        this.device = null;
	    }
	
	    // Return true if the application can be opened now
	    checkCanOpen() {
	        return true;
	    }
	
	    // Return true if the application can be closed now
	    checkCanClose() {
	        return true;
	    }
	
	    // Called when the player focuses on this application
	    onOpen() {
	        return console.log(`[APP: ${ this.appName }] onOpen`);
	    }
	
	    // Called when the player leaves the application window
	    onClose() {
	        return console.log(`[APP: ${ this.appName }] onClose`);
	    }
	
	};
	;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.PhoneDevice = exports.Phone = exports.Message = exports.DialogueWait = exports.DialogueEvent = exports.DialogueChoice = exports.DialogueChoiceHub = exports.DialogueText = exports.DialogueNode = exports.DialogueGraph = exports.Chat = undefined;
	
	var _app = __webpack_require__(1);
	
	var _app2 = _interopRequireDefault(_app);
	
	var _hubdevice = __webpack_require__(3);
	
	var _hubdevice2 = _interopRequireDefault(_hubdevice);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Abstract base class for IRC and phone apps
	class Chat extends _app2.default {
	
	    constructor($screen) {
	        super($screen);
	
	        // [bool] Safety flag that is true when the first message in the queue
	        // has a timeout pending, to avoid sending the same message twice
	        this.isPreparingNextMessage = false;
	        // [bool] Is the player character typing on the phone?
	        this.isTyping = false;
	        // [bool] Should the player type a message when he/she opens the chat next time?
	        this.mustType = false;
	
	        // [DialogueGraph] current dialogue graph
	        this.dialogueGraph = null;
	        // [DialogueNode] current dialogue node
	        this.currentDialogueNode = null;
	
	        // OPTIMIZE: use Queue.js if an array is too slow (only better over 2 elements,
	        // and we have an average of 2 lines per text node)
	        // [Message[]] queue of messages to be sent
	        this.messageQueue = [];
	
	        // jQuery element for the list of messages
	        this.$chatHistory = $screen.find(".history");
	        this.$chatHistoryList = this.$chatHistory.find("ul");
	        this.$chatInput = $screen.find(".input");
	        this.$chatInputList = this.$chatInput.find("ul");
	
	        this.receivedMessageTemplate = Handlebars.compile($("#message-received-template").html());
	        this.sentMessageTemplate = Handlebars.compile($("#message-sent-template").html());
	        this.messageChoiceTemplate = Handlebars.compile($("#message-choice-template").html());
	    }
	
	    // [override]
	    checkCanClose() {
	        if (this.isTyping) {
	            console.log(`[CHAT] Cannot close ${ this.appName }, player character is typing`);
	        }
	        return !this.isTyping;
	    }
	
	    // [override]
	    onOpen() {
	        this.device.notify(false);
	        if (this.mustType) {
	            // current hub app has been set to Chat subclass name,
	            // so calling @prepareNextMessage should correctly send the PC's next message now
	            return this.prepareNextMessage();
	        }
	    }
	
	    // Start a dialogue graph stored in game data, by name
	    //
	    // @param dialogueName [String] name of the dialogue stored in game data
	    startDialogueByName(dialogueName) {
	        return this.startDialogue(game.data.dialogueGraphs[dialogueName]);
	    }
	
	    // Start a dialogue graph
	    //
	    // @param dialogueGraph [DialogueGraph]
	    startDialogue(dialogueGraph) {
	        this.dialogueGraph = dialogueGraph;
	        let initialNode = dialogueGraph.getInitialNode();
	        return this.enterDialogueNode(initialNode);
	    }
	
	    // Continue dialogue on given node, by name, or do nothing if nodeName is null
	    //
	    // @param nodeName [String] name of the node to enter
	    enterDialogueNodeByName(nodeName) {
	        if (nodeName != null) {
	            return this.enterDialogueNode(this.dialogueGraph.getNode(nodeName));
	        }
	    }
	
	    // Continue dialogue on given node, end if node is null
	    //
	    // @param dialogueNode [DialogueNode] node to enter
	    enterDialogueNode(dialogueNode) {
	        if (this.currentDialogueNode != null) {
	            this.currentDialogueNode.onExit(this);
	        }
	        this.currentDialogueNode = dialogueNode;
	        // if node is null, end dialogue, else enter node
	        if (dialogueNode != null) {
	            return dialogueNode.onEnter(this);
	        } else {
	            return this.dialogueGraph = null;
	        }
	    }
	
	    // Choose given choice, triggering all associated events
	    //
	    // @choice [DialogueChoice]
	    choose(choice) {
	        //    for event in choice.events
	        //      console.log "Game event #{event} -> true"
	        //      game.events[event] = true
	        return this.enterDialogueNode(choice);
	    }
	
	    // Send or receive message depending on sender
	    //
	    // @param sender [String] message sender
	    sendOrReceiveMessage(message) {
	        if (message.sender === "pc") {
	            return sendMessage(message);
	        } else {
	            return receiveMessage(message);
	        }
	    }
	
	    // Send message choice to chat
	    //
	    // @param message [Message] message to send
	    sendMessage(message) {
	        return this.printMessage(message, this.sentMessageTemplate);
	    }
	
	    // Show new message received in chat history
	    //
	    // @param message [Message] message received
	    receiveMessage(message) {
	        // show phone notification on hub if the player is not already viewing the phone
	        if (game.hub.currentAppName !== this.appName) {
	            // "irc" for IRC, "phone" for the phone
	            this.device.notify();
	        }
	        return this.printMessage(message, this.receivedMessageTemplate);
	    }
	
	    // Print message from character in chat
	    //
	    // @param message [Message] message to print
	    // @param template [Handlebars.Template] message template corresponding to the character speaking
	    printMessage(message, template) {
	        // REFACTOR: character name localization system with tag ("mathilde" or "$C2" for more hardcore)
	        if (message.sender === "pc") {
	            // use 'pc' for any player character message, then add % in front of name
	            var senderCode = "you";
	        } else {
	            var senderCode = message.sender;
	        }
	        let sender = game.locale.getName(senderCode);
	        let context = {
	            message: message.content,
	            sender,
	            time: message.date
	        };
	        this.$chatHistoryList.append(template(context));
	        return this.scrollToBottom();
	    }
	
	    // Scroll chat history to bottom
	    scrollToBottom() {
	        return this.$chatHistory.animate({ scrollTop: this.$chatHistory[0].scrollHeight }, 200, "swing");
	    }
	
	    // Show available replies for the player
	    //
	    // @param choices [DialogueChoice[]] list of choice nodes
	    showChoices(choices) {
	        // show all choices in input area from template
	        return choices.forEach(choice => {
	            if (choice == null) {
	                throw new Error(`Could not find choice node ${ choice.name } in dialogue ${ dialogueGraph.name }`);
	            }
	            // create <li> jQuery element from template
	            let localizedLine = game.locale.getLine(choice.lines[0]); // first line is representative for choice
	            let choiceEntry = $(this.messageChoiceTemplate({ choiceMessage: localizedLine }));
	            // add onclick event with choice inside forEach's closure
	            choiceEntry.click(() => this.choose(choice));
	            return this.$chatInputList.append(choiceEntry);
	        });
	    }
	
	    // Remove choices from input area
	    hideMessageChoices() {
	        return this.$chatInputList.empty();
	    }
	
	    // Set timer to send/receive next message in the queue if any, else enter next node
	    prepareNextMessage() {
	        //    console.log "[CHAT] prepareNextMessage()"
	        // set flag to avoid preparing the same message a 2nd time later
	        this.isPreparingNextMessage = true;
	        if (this.messageQueue.length > 0) {
	            // prepare to send/receive next message in the queue
	            //      console.log "[CHAT] Get next message from queue"
	            let nextMessage = this.messageQueue[0];
	
	            // if message from player character and player is not viewing this app,
	            // do not let player character type message until this is the case
	            if (nextMessage.sender === "pc") {
	                if (game.hub.currentAppName === this.appName || true) {
	                    this.isTyping = true;
	                    this.mustType = false; // if chat was closed before and mustType flag was set, revert it now
	                } else {
	                    console.log(`[CHAT] ${ this.appName } is closed, will type message next time chat is entered`);
	                    this.mustType = true;
	                    return;
	                }
	            }
	
	            // prepare timer to send or receive future next message
	            return setTimeout(() => this.processNextMessage(), nextMessage.sendTime);
	        } else {
	            // last message processed, go to next node (unique successor of the current text or choice node)
	            return this.enterDialogueNode(this.currentDialogueNode.successor);
	        }
	    }
	
	    // Receive message passed as parameter and
	    processNextMessage() {
	        // release flag, can prepare another message from here
	        this.isPreparingNextMessage = false;
	        // send or receive message just arriving now
	        let message = this.messageQueue.shift();
	        if (message.sender === "pc") {
	            this.sendMessage(message);
	            // the player character is not typing anymore and may leave the app (unless she starts writing another message now)
	            this.isTyping = false;
	        } else {
	            this.receiveMessage(message);
	        }
	
	        return this.prepareNextMessage();
	    }
	}
	
	exports.Chat = Chat;
	class DialogueGraph {
	
	    // @param name [String] dialogue name
	    // @param nodes [String: DialogueNode] dictionary of dialogue nodes
	    // @param initialNodeName [String] name of the first node of the dialogue
	    constructor(name, nodes = {}, initialNodeName = "initial") {
	        this.name = name;
	        this.nodes = nodes;
	        this.initialNodeName = initialNodeName;
	    }
	
	    // Add a node to the dialogue graph
	    //
	    // @param node [DialogueNode]
	    addNode(node) {
	        // IMPROVE: in JS, objects use strings for keys anyway, so either use an array or any string key
	        return this.nodes[node.name] = node;
	    }
	
	    // Return initial node of the dialogue
	    getInitialNode() {
	        return this.nodes[this.initialNodeName];
	    }
	
	    // Return node by id, null if none found
	    //
	    // name [String] id of the node to find
	    getNode(name) {
	        if (!(name in this.nodes)) {
	            console.warn(`[DIALOGUE] Node ${ name } not found`);
	            return null;
	        }
	        return this.nodes[name];
	    }
	
	    toString() {
	        return `DialogueGraph ${ this.name }`;
	    }
	}
	
	exports.DialogueGraph = DialogueGraph;
	class DialogueNode {
	
	    // Construct a dialogue node
	    //
	    // @param name [String] string identifier
	    // @param type [String] node type: "text", "choice hub" or "choice" (redundant but convenient)
	    constructor(name, type) {
	        this.name = name;
	        this.type = type;
	    }
	
	    // Function called when the node is entered. Contains all the node's logic
	    //
	    // @param chat [Chat] chat managing the dialogue
	    onEnter(chat) {
	        throw new Error("onEnter is not defined for an abstract DialogueNode");
	    }
	
	    onExit(chat) {}
	}
	
	exports.DialogueNode = DialogueNode;
	class DialogueText extends DialogueNode {
	
	    // Construct a dialogue node
	    //
	    // @param name [String] string identifier
	    // @param lines [String[]] messages to receive
	    // @param successor [DialogueNode] successor node
	    // @param speaker [String] speaker, either "pc" (player character) or "other"
	    constructor(name, lines, successor, speaker = "pc") {
	        super(name, "text");
	        this.lines = lines;
	        this.successor = successor;
	        this.speaker = speaker;
	    }
	
	    toString() {
	        return `DialogueText ${ this.name } -> ${ this.successor != null ? this.successor.name : "END" }`;
	    }
	
	    onEnter(chat) {
	        // for TEXT nodes, either send or receive all messages in the node, depending on the sender
	        // to do this timely, create a queue of messages waiting to be sent
	        for (let i = 0; i < this.lines.length; i++) {
	            let lineID = this.lines[i];
	            let line = game.locale.getLine(lineID);
	            // natural thinking + typing waiting time before sending message, affine of length message
	            let typingTime = 1500 + 20 * line.length;
	            console.log(`Message thinking/typing time of '${ line }': #{typingTime/1000}s`);
	            chat.messageQueue.push(new Message(this.speaker, "2027", line, typingTime));
	        }
	
	        // process queue by starting with first message
	        return chat.prepareNextMessage();
	    }
	}exports.DialogueText = DialogueText;
	;
	
	class DialogueChoiceHub extends DialogueNode {
	
	    // @param name [String] string identifier
	    // @param choices [DialogueNode] available choices after all messages have been received
	    constructor(name, choices) {
	        super(name, "choice hub");
	        this.choices = choices;
	    }
	
	    toString() {
	        return `DialogueChoiceHub ${ this.name } -> ${ this.choices.map(e => e.name).join(", ") }`;
	    }
	
	    onEnter(chat) {
	        // for CHOICE HUB nodes, display available choices
	        return chat.showChoices(this.choices);
	    }
	
	    onExit(chat) {
	        return chat.hideMessageChoices();
	    }
	}
	
	exports.DialogueChoiceHub = DialogueChoiceHub;
	class DialogueChoice extends DialogueNode {
	
	    // @param name [String] string identifier
	    // @param lines [String[]] messages sent when selecting this choice; the 1st is the one to click on
	    // @param successor [DialogueNode] successor node
	    constructor(name, lines, successor) {
	        super(name, "choice");
	        this.lines = lines;
	        this.successor = successor;
	    }
	
	    toString() {
	        return `DialogueChoice ${ this.name } '${ this.lines.join("; ") }' -> ${ this.successor != null ? this.successor.name : "END" }`;
	    }
	
	    onEnter(chat) {
	        // for CHOICE node, remove choices, send choice messages and trigger associated effects
	        chat.hideMessageChoices();
	        for (let i = 0; i < this.lines.length; i++) {
	            let lineID = this.lines[i];
	            let line = game.locale.getLine(lineID);
	            // typing time is similar to text node calculation, except the 1st message is immediate
	            // (assume the player character has typed it while you were thinking which choice to make)
	            let typingTime = i === 0 ? 0 : 1500 + 20 * line.length;
	            console.log(`Message thinking/typing time of ${ line }: ${ typingTime / 1000 }s`);
	            chat.messageQueue.push(new Message("pc", "2027", line, typingTime));
	        }
	
	        return chat.prepareNextMessage();
	    }
	}
	
	exports.DialogueChoice = DialogueChoice; // Special dialogue node that calls an event function and immediately goes to the next node
	
	class DialogueEvent extends DialogueNode {
	
	    // @param name [String] string identifier
	    // @param eventFunction [Function()] event function to call
	    // @param successor [DialogueNode] successor node
	    constructor(name, eventFunction, successor) {
	        super(name, "event");
	        this.eventFunction = eventFunction;
	        this.successor = successor;
	    }
	
	    toString() {
	        return `DialogueEvent ${ this.name } -> ${ this.successor != null ? this.successor.name : "END" }`;
	    }
	
	    onEnter(chat) {
	        // for EVENT node, call the event function and go to next node
	        this.eventFunction();
	        return chat.enterDialogueNode(this.successor);
	    }
	}
	
	exports.DialogueEvent = DialogueEvent; // Node to wait between two nodes; useful to emphasize break in a conversation
	
	class DialogueWait extends DialogueNode {
	
	    // @param name [String] string identifier
	    // @param waitTime [float] time to wait in ms
	    // @param successor [DialogueNode] successor node
	    constructor(name, waitTime, successor) {
	        super(name, "wait");
	        this.waitTime = waitTime;
	        this.successor = successor;
	    }
	
	    toString() {
	        return `DialogueWait ${ this.name }  (${ this.waitTime } ms) -> ${ this.successor != null ? this.successor.name : "END" }`;
	    }
	    //"DialogueWait #{@name} (#{@waitTime} ms) -> #{if @successor? then @successor.name else "END"}"
	
	    onEnter(chat) {
	        // for WAIT node, wait given time and go to next node
	        console.log(this.waitTime);
	        return setTimeout(() => chat.enterDialogueNode(this.successor), this.waitTime);
	    }
	}
	
	exports.DialogueWait = DialogueWait; // Any kind of message sent in a chat from a character to another
	
	class Message {
	
	    // @param sender [String] name of the sender
	    // @param date [String] day when message is sent
	    // @param content [String] message text content
	    // @param sendTime [String] thinking + typing time for that message
	    constructor(sender, date, content, sendTime) {
	        this.sender = sender;
	        this.date = date;
	        this.content = content;
	        this.sendTime = sendTime;
	    }
	}
	
	exports.Message = Message;
	class Phone extends Chat {
	
	    constructor($screen, $device) {
	        super($screen);
	        this.device = new PhoneDevice($device);
	        this.appName = "phone";
	    }
	
	}
	
	exports.Phone = Phone;
	class PhoneDevice extends _hubdevice2.default {
	
	    constructor($device) {
	        super($device);
	
	        this.notify = this.notify.bind(this);
	        this.phoneAudio = new Audio();
	        this.phoneAudio.src = game.audioPath + 'sfx/phone_notification.mp3';
	        //    @phoneAudio.loop = true
	
	        $device.addClass("notify-off");
	    }
	
	    // If active is true, show a visual cue to notify the player that something new has happened
	    // If active is false, stop showing visual cue for new events
	    // If notification is already in this state, though, nothing happens
	    notify(active = true) {
	        if (this.notificationActive === active) {
	            return;
	        }
	
	        this.notificationActive = active;
	        let state = active ? "on" : "off";
	        let oppositeState = active ? "off" : "on";
	
	        // change class to trigger notification style / animation
	        this.$device.removeClass(`notify-${ oppositeState }`);
	        this.$device.addClass(`notify-${ state }`);
	
	        if (active) {
	            return this.phoneAudio.play();
	        } else {
	            this.phoneAudio.pause();
	            return this.phoneAudio.currentTime = 0;
	        }
	    }
	}
	exports.PhoneDevice = PhoneDevice;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// Base class for devices on the hub attached to a given app
	exports.default = class {
	
	    // $device [jQuery] device element on the hub for this app
	    constructor($device) {
	        this.notificationActive = false;
	
	        this.$device = $device;
	    }
	
	    // Send notification cue on this device if active is true, stop notification cue else
	
	
	    // Is the device sending a visual / audio notification?
	    notify(active = true) {
	        this.notificationActive = active;
	        return console.log(`[DEVICE] notify (state = ${ state }) has not been defined on device ${ this }`);
	    }
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.GameData = undefined;
	
	var _chat = __webpack_require__(2);
	
	var _mission = __webpack_require__(5);
	
	var _mission2 = _interopRequireDefault(_mission);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	class GameData {
	
	    // GameData is a singleton, so keep the data as instance and not static for now
	
	    // default attributes require babel-plugin-transform-class-properties
	    constructor() {
	        this.missions = { "mission01": new _mission2.default("mission01", function () {}, function () {}) };
	        this.eventFunctions = {
	            ["mission-test.start"]() {
	                return game.servers["moogle"].getRoot().getDir('home/john').addFile(new TextFile("mail", ["mt1_t1_01", "mt1_t1_02"].map(game.locale.getLine).join('\n'), "mission-test.conclusion"));
	            },
	            ["mission-test.conclusion"]() {
	                // FIXME: can finish the game by reading the correct file from the beginning
	                return game.phone.startDialogueByName("mission-test.conclusion");
	            },
	            ["mission-tutorial.conclusion"]() {
	                return game.phone.startDialogueByName("mission-tutorial.conclusion");
	            }
	        };
	    }
	    // this.buildDialogueGraphs = this.buildDialogueGraphs.bind(this);
	
	
	    // @param dialogueFilename [String] path of the JSON file containing all dialogues
	    loadDialogueGraphs(dialogueGraphsFilename) {
	        return $.getJSON(dialogueGraphsFilename, data => this.buildDialogueGraphs(data)).done(() => console.log("[LOAD] Loaded dialogue graphs")).fail(() => console.log("[ERROR] Failed loading dialogue graphs"));
	    }
	
	    // Build dictionary of dialogue graphs from JSON data
	    //
	    // @param data [dictionary] dictionary with JSON data
	    buildDialogueGraphs(data) {
	        //    console.log "[CALL] buildDialogueGraphs"
	        this.dialogueGraphs = {};
	        // REFACTOR: use https://esdiscuss.org/topic/es6-iteration-over-object-values to help if too hard to type
	        // REFACTOR: ES6 offers for of for maps, but need conversion from object to map
	        for (let dialogueName of Object.keys(data)) {
	            let dialogueData = data[dialogueName];
	            this.dialogueGraphs[dialogueName] = new _chat.DialogueGraph(dialogueName);
	            // first pass: fill dialogue by identifying successors and choices with name only
	            // events have already been defined so you can link them already
	            for (let nodeName of Object.keys(dialogueData)) {
	                let nodeData = dialogueData[nodeName];
	                switch (nodeData.type) {
	                    case "text":
	                        var node = new _chat.DialogueText(nodeName, nodeData.lines, nodeData.successor, nodeData.speaker);
	                        break;
	                    case "choice hub":
	                        node = new _chat.DialogueChoiceHub(nodeName, nodeData.choices);
	                        break;
	                    case "choice":
	                        node = new _chat.DialogueChoice(nodeName, nodeData.lines, nodeData.successor);
	                        break;
	                    case "event":
	                        node = new _chat.DialogueEvent(nodeName, this.eventFunctions[nodeData.eventName], nodeData.successor);
	                        break;
	                    case "wait":
	                        node = new _chat.DialogueWait(nodeName, 1000 * nodeData.time, nodeData.successor); // s to ms conversion
	                        break;
	                    default:
	                        throw new Error(`Node ${ nodeName } has unknown type ${ nodeData.type }`);
	                }
	                this.dialogueGraphs[dialogueName].addNode(node);
	            }
	            // second pass: link node with successor/choices by name, since now all nodes have been defined
	            // this requires more computation during building process but ensures all names are resolved
	            for (let nodeName of Object.keys(this.dialogueGraphs[dialogueName].nodes)) {
	                node = this.dialogueGraphs[dialogueName].nodes[nodeName];
	                if (['text', 'choice', 'event', 'wait'].includes(node.type) && node.successor != null) {
	                    let successor = this.dialogueGraphs[dialogueName].getNode(node.successor);
	                    if (successor == null) {
	                        throw new Error(`Successor ${ node.successor } not found in dialogue ${ dialogueName }`);
	                    }
	                    node.successor = successor; // from String to DialogueNode
	                } else if (node.type === "choice hub") {
	                    for (let [i, choiceName] of node.choices.entries()) {
	                        let choice = this.dialogueGraphs[dialogueName].getNode(choiceName);
	                        if (choice == null) {
	                            throw new Error(`Choice ${ choiceName } not found in dialogue ${ dialogueName }`);
	                        }
	                        node.choices[i] = choice; // from String to DialogueNode
	                    }
	                }
	            }
	        }
	    }
	}
	
	exports.GameData = GameData; /* TEMPLATE for dialogue.json
	                              (when one successor is a choice, all successors should be choices)
	                             
	                              {
	                              "missionName.phaseName": {
	                              "initial": {},  // reserved name for initial node
	                             
	                              "sentence": {
	                              "type": "text",
	                              "lines": ["Hi!"],
	                              "successor": "question?"
	                              },
	                              "question?": {
	                              "type": "text",
	                              "lines": ["...?"],
	                              "successor": "question!"
	                              },
	                              "question!": {
	                              "type": "choice node",
	                              "choices": ["choice1!", "choice2!", "questionChoice3?!"]
	                              },
	                              "choice1!": {
	                              "type": "choice",
	                              "lines": ["Yes."],
	                              "successors": []
	                              },
	                              "choice2!": {
	                              "type": "choice",
	                              "lines": ["No."],
	                              "successors": []
	                              },
	                              "questionChoice3?!": {
	                              "type": "choice",
	                              "lines": ["What do you mean?."],
	                              "successors": []
	                              }
	                              }
	                              }
	                              */

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// require "game.js"
	
	exports.default = class {
	
	    // @param title [String] mission title
	    // @param onStart [Function()] called when the mission starts
	    // @param onComplete [Function()] called when the mission is completed
	    constructor(title, onStart, onComplete) {
	        this.title = title;
	        this.onStart = onStart;
	        this.onComplete = onComplete;
	    }
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// REFACTOR: use enumify or es6-enum (install via npm)
	const Keycode = exports.Keycode = {
	    LEFT: 37,
	    UP: 38,
	    RIGHT: 39,
	    DOWN: 40
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * Created by Long Nguyen Huu on 2016/11/06.
	 * Based on http://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax
	 */
	
	class ExtendableError extends Error {
	    constructor(message) {
	        super(message);
	        this.name = this.constructor.name;
	        this.message = message;
	        if (typeof Error.captureStackTrace === 'function') {
	            Error.captureStackTrace(this, this.constructor);
	        } else {
	            this.stack = new Error(message).stack;
	        }
	    }
	}
	
	exports.ExtendableError = ExtendableError;
	class TerminalSyntaxError extends ExtendableError {
	    constructor(m) {
	        super(m);
	    }
	}
	exports.TerminalSyntaxError = TerminalSyntaxError;

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	
	// list of event functions to call, identified by a string
	let eventCallbacks = {
	    "accept mission": missionTitle => {},
	
	    "mission01.": 46
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _app = __webpack_require__(1);
	
	var _app2 = _interopRequireDefault(_app);
	
	var _story = __webpack_require__(10);
	
	var _hub = __webpack_require__(11);
	
	var _hub2 = _interopRequireDefault(_hub);
	
	var _terminal = __webpack_require__(12);
	
	var _locale = __webpack_require__(14);
	
	var _locale2 = _interopRequireDefault(_locale);
	
	var _chat = __webpack_require__(2);
	
	var _settings = __webpack_require__(15);
	
	var _settings2 = _interopRequireDefault(_settings);
	
	var _data = __webpack_require__(4);
	
	var _models = __webpack_require__(16);
	
	var _server = __webpack_require__(13);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = class {
	
	    // @param srcPath [String] relative path to src folder from main HTML page, ending with '/'
	
	
	    // domain table of URL [string]: IP [string]
	    constructor(srcPath) {
	        this.dns = { "besafe.com": "256.241.23.02" };
	        this.apps = {};
	        this.bgm = "bgm.mp3";
	        this.servers = {
	            "local": new _server.Server("local", "456.231.24.57", [new _server.Directory("home", [new _server.TextFile("tutorial", "Entrez vos commandes dans le terminal et pressez ENTER\n" + "Utilisez les flèches HAUT et BAS pour retrouver les dernières commandes entrées\n\n" + "connect est une commande très puissante qui infiltre automatiquement un server par son adresse IP ou son URL.\n" + "Les fichiers texte sont affichés par ls avec l'extension .txt. Les autres sont tous des dossiers.\n\n" + "Pour remonter au dossier supérieur, entrez cd ..\n\n" + "Pour lire un fichier texte, entrez cat + nom du fichier. Il n'est pas nécessaire d'écrire l'extension dans le nom du fichier.")])]),
	            "besafe": new _server.Server("besafe.com", "256.241.23.02", [new _server.Directory("etc"), new _server.Directory("locate-e", [new _server.Directory("edvige-novik"), new _server.Directory("edward-claes"), new _server.Directory("edward-karlsson"), new _server.Directory("edward-rolland"), new _server.Directory("egino-morel"), new _server.Directory("eileen-bruno"), new _server.Directory("elayne-costa"), new _server.Directory("elise-geraert", [new _server.TextFile("locate-car", "South Region, District 14, Area 2, Building 12 : NewLab Enterprise\nFuel : 83%\nStatus : Scratch on passenger door"), new _server.TextFile("locate-key", "South Region, District 14, Area 3, Building 5 : University of Neus, VR Seminar Room", "mission-tutorial.conclusion"), new _server.TextFile("locate-phone", "South Region, District 14, Area 2, Building 12 : NewLab Enterprise")]), new _server.Directory("elise-giordano"), new _server.Directory("elise-kieffer"), new _server.Directory("eleanor-bonnet"), new _server.Directory("eleanor-petridis")]), new _server.Directory("var")], [new _server.DatabaseSim([new _server.Table("user_table", { 0: new _models.User(0, "john", "dd6x5few961few68fq4wd6", "California") })])])
	        };
	
	        this.srcPath = srcPath;
	        this.audioPath = srcPath + 'audio/';
	        this.imagePath = srcPath + 'img/';
	    }
	
	    // dictionary of serverID [string]: server [Server]
	
	
	    loadModules() {
	        let modulePath = this.srcPath + 'modules/';
	        return $.when($.get(modulePath + "hub.html"), $.get(modulePath + "phone.html"), $.get(modulePath + "terminal.html"), $.get(modulePath + "settings.html")
	        // if assignment destructuration does not work inside function parameter definition, just use hubHTMLArray argument,
	        // then get hutHTMLArray[0], etc.
	        ).done(function ([hubHTML, ...args1], [phoneHTML, ...args2], [terminalHTML, ...args3], [settingsHTML, ...args4]) {
	            console.log("[LOAD] Loaded Hub, Phone, Terminal HTML");
	            $("#content").html(hubHTML);
	            $("#phoneContent").html(phoneHTML);
	            $("#terminalContent").html(terminalHTML);
	            return $("#settingsContent").html(settingsHTML);
	        });
	    }
	
	    initModules() {
	        console.log("[GAME] initialize modules");
	        if (typeof game === 'undefined' || game === null) {
	            throw new Error("document.game has not been defined, please create a game instance with @game = new Game first.");
	        }
	        this.hub = new _hub2.default($("#screens"), $("#desk"));
	        this.terminal = this.apps['terminal'] = new _terminal.Terminal($("#terminal-screen"), $("#terminal-device"));
	        this.phone = this.apps['phone'] = new _chat.Phone($("#phone-screen"), $("#phone-device"));
	        this.apps['memo'] = new _app2.default(null, null);
	        this.apps['other'] = new _app2.default(null, null);
	        this.apps['news'] = new _app2.default(null, null);
	        //    @apps['camera'] = new App null, null
	        this.settings = this.apps['settings'] = new _settings2.default($("#settings-screen"), $("#settings-device"));
	
	        return this.story = new _story.Story();
	    }
	
	    // @param dialogueFilename [String] path from src of the JSON file containing all dialogues
	    loadData(dialogueFilename) {
	        // [GameData] contains all game story data
	        this.data = new _data.GameData();
	        return this.data.loadDialogueGraphs(game.srcPath + dialogueFilename);
	    }
	
	    // @param lang [String] language code
	    loadLocale(lang) {
	
	        this.locale = new _locale2.default();
	        // bundle both deferred objects in parallel so that returned value can be reused with .done()
	        // REFACTOR: use node.js path library or similar for cleaner path joins
	        return $.when(this.locale.loadDialogueLines(game.srcPath + `locales/${ lang }/dialogues.json`), this.locale.loadNames(game.srcPath + `locales/${ lang }/names.json`));
	    }
	
	    // Return event function by name
	    //
	    // @param name [String] event name
	    getEvent(name) {
	        return this.data.eventFunctions[name];
	    }
	
	    // Run event function by name
	    //
	    // @param name [String] event name
	    triggerEvent(name) {
	        return this.data.eventFunctions[name]();
	    }
	
	    playBGM() {
	        let bgmAudio = new Audio();
	        bgmAudio.src = game.audioPath + 'bgm/' + this.bgm;
	        bgmAudio.loop = true;
	        return bgmAudio.play();
	    }
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	class StoryGraph {
	
	    // @param nodes [{String: StoryNode}] story nodes identified by their titles
	    // @param initialNodeTitle [String] title of the first node of the story
	    constructor(nodes = {}, initialNodeTitle = "initial") {
	        this.nodes = nodes;
	        this.initialNodeTitle = initialNodeTitle;
	    }
	
	    // Add a node to the story graph
	    //
	    // @param node [StoryNode]
	    addNode(node) {
	        return this.nodes[node.title] = node;
	    }
	
	    // Return initial node of the story
	    getInitialNode() {
	        return this.nodes[this.initialNodeTitle];
	    }
	
	    // Return node by id
	    //
	    // @param title [String] title of the node to find
	    getNode(title) {
	        if (!(title in this.nodes)) {
	            throw `Node '${ title }' is not in the story graph`;
	        }
	        return this.nodes[title];
	    }
	}
	
	exports.StoryGraph = StoryGraph;
	class StoryNode {
	
	    // @param title [String] unique meaningful name to identify this node
	    // @param onEnter [function] callback called when the node is entered
	    // @param successors [StoryNode[]] possible successor nodes in the story
	    constructor(title, onEnter, successors = []) {
	        this.title = title;
	        this.successors = successors;
	        // use provided onEnter callback if any, else keep default
	        if (onEnter != null) {
	            this.onEnter = onEnter;
	        }
	    }
	
	    onEnter() {
	        throw `${ this } has not implemented the 'onEnter' method.`;
	    }
	}
	
	exports.StoryNode = StoryNode; // Story class, only one instance should be created and used as member of @game
	// Manages story and mission progression
	
	class Story {
	    // current story node (there should always be one during the game)
	
	
	    // story
	    constructor() {
	        this.storyGraph = null;
	        this.currentStoryNode = null;
	        this.currentMission = null;
	        this.events = { "mission01.accepted": false };
	    }
	
	    // @param storyGraph [StoryGraph] story graph of the entire game
	    // [Mission] current mission, null if none
	
	    // dictionary of event [string]: hasHappened [bool]
	    // game story graph (unique)
	    start(storyGraph) {
	        console.log("[STORY] Start");
	        this.storyGraph = storyGraph;
	        return this.enterNode(storyGraph.getInitialNode());
	    }
	
	    // Start or continue story on given node
	    //
	    // @param storyNode [StoryNode]
	    enterNode(storyNode) {
	        this.currentStoryNode = storyNode;
	        return this.currentStoryNode.onEnter(); // trigger onEnter events such as notifications
	    }
	
	    // Accept new mission and start immediately
	    //
	    // @param title [String] mission title
	    startMission(title) {
	        if (this.currentMission !== null) {
	            throw new Exception(`Cannot start new mission ${ title } while there is a current mission, ${ this.currentMission.title }`);
	        }
	        this.currentMission = game.missions[title];
	        return this.currentMission.onStart();
	    }
	}exports.Story = Story;
	;

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = class {
	
	    constructor($screens, $desk) {
	        this.$screens = $screens;
	        this.$desk = $desk;
	
	        // [String: DialogFx] dictionary of dialogs, one per app
	        this.dialogs = {};
	
	        // state vars
	        this.currentAppName = 'none'; // current app name: 'none' if none is open, 'terminal', 'chat', etc.
	
	        // add images from script to ensure path is correct
	        let screensImage = new Image();
	        screensImage.src = game.imagePath + 'hub/screens.png';
	        this.$screens.prepend(screensImage);
	
	        let deskImage = new Image();
	        deskImage.src = game.imagePath + 'hub/desk.png';
	        this.$desk.prepend(deskImage);
	
	        // bind "open modular window" event to each monitocr
	        let dlgtrigger = $('[data-dialog]');
	        let iterable = dlgtrigger.toArray();
	        for (let i = 0; i < iterable.length; i++) {
	            //      console.log(i)
	            let element = iterable[i];
	            let dialogAppName = element.getAttribute('data-dialog');
	            let dialog = $(`#${ dialogAppName }Dialog`)[0];
	            // REFACTOR: let DialogFx have name member and use that instead of currentAppName + do()
	            let dialogFx = this.dialogs[dialogAppName] = new DialogFx(dialog, {
	                // IMPROVE: in ES6, maybe no need to pass local vars, they may be transferred like "this" (check out)
	                //     onOpenDialog: (dialogAppName => dialog => this._onOpen(dialogAppName))(dialogAppName),
	                onOpenDialog: dialog => this._onOpen(dialogAppName),
	                onCloseDialog: dialog => this._onClose()
	            });
	
	            // on click, display app window and open app (focus, etc.)
	            $(element).click((dialogFx => () => dialogFx.open())(dialogFx));
	        }
	
	        //    dlgtrigger.each ((i, element) ->
	        //        $.proxy ->
	        //    #      console.log(i)
	        //          dialogAppName = element.getAttribute 'data-dialog'
	        //          somedialog = $('#' + dialogAppName + 'Dialog')[0]
	        //          _this.dialogs[dialogAppName] = new DialogFx somedialog
	        //          # on click, display app window and open app (focus, etc.)
	        //          $(element).click -> _this.open dialogAppName)
	
	        // activate parallax from mouse
	        $('#parallax .parallax-layer').parallax({
	            mouseport: $('#parallax') });
	    }
	
	    // Callback when opening application by name: update current app and setup app state
	    //
	    // @param appName [String]
	    _onOpen(appName) {
	        // check that there is no other app open (TODO: except notes)
	        if (this.currentAppName !== 'none') {
	            console.warn(`[WARNING] Trying to open app ${ appName } but app ${ this.currentAppName } is already open`);
	            return false;
	        }
	
	        let app = game.apps[appName];
	
	        if (app.checkCanOpen()) {
	            this.currentAppName = appName;
	            app.onOpen(); // call this after setting the new app name, it may need it
	            return true;
	        }
	
	        return false;
	    }
	
	    // Callback when closing current application: set current app to 'none' and clean app state
	    _onClose() {
	        if (this.currentAppName === 'none') {
	            console.warn("[WARNING] Trying to close current app but no app is currently open");
	            return false;
	        }
	
	        let app = game.apps[this.currentAppName];
	
	        if (app.checkCanClose()) {
	            app.onClose(); // call this before resetting app name, it may need the old one
	            this.currentAppName = 'none';
	            return true;
	        }
	
	        return false;
	    }
	};
	;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SyntaxTree = exports.Terminal = exports.TerminalDevice = undefined;
	
	var _app = __webpack_require__(1);
	
	var _app2 = _interopRequireDefault(_app);
	
	var _server = __webpack_require__(13);
	
	var _enum = __webpack_require__(6);
	
	var _hubdevice = __webpack_require__(3);
	
	var _hubdevice2 = _interopRequireDefault(_hubdevice);
	
	var _error = __webpack_require__(7);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	class TerminalDevice extends _hubdevice2.default {
	
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
	}exports.TerminalDevice = TerminalDevice;
	;
	
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
	
	class Terminal extends _app2.default {
	
	    // Construct terminal from div container
	    //
	    // $screen [jQuery] jQuery element for the terminal-screen div
	    constructor($screen, $device) {
	        super($screen, $device);
	        this.openedOnce = false;
	        this.device = new TerminalDevice($device);
	
	        this.interpreter = new CommandInterpreter(this);
	
	        this.output = []; // [String[]] output lines, including commands entered by the player
	        this.$output = $screen.find(".output");
	
	        this.history = [""]; // [String[]] command history, as a reversed queue, with last buffer as 1st element
	        this.historyIndex = 0; // [int] current index of command-line history, 0 for current buffer, 1 for previous command, etc.
	        this.$promptInput = $screen.find(".prompt-input");
	
	        this.connectionStack = []; // [Server[]] stack of servers through which you connected, last is current server
	        this.directoryStack = []; // [Directory[]] stack of directories corresponding to path to working directory
	
	        // connect terminal to local server (will also set working dir to its root)
	        this.connect(game.servers["local"]);
	
	        // bind up/down arrow press to history navigation
	        this.$promptInput.keydown(event => {
	            switch (event.which) {
	                case _enum.Keycode.UP:
	                    this.navigateHistory(1);
	                    return false; // stop propagation
	                case _enum.Keycode.DOWN:
	                    this.navigateHistory(-1);
	                    return false;
	            }
	        }); // stop propagation
	
	        // replace normal submit behavior for prompt
	        $screen.find(".prompt-submit").click(() => this.enterCommand(this.$promptInput.val()));
	    }
	
	    // Current server get property
	    get currentServer() {
	        return this.connectionStack[this.connectionStack.length - 1];
	    }
	
	    // Current directory get property
	    get currentDirectory() {
	        return this.directoryStack[this.directoryStack.length - 1];
	    }
	
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
	        });
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
	        } else {
	            return;
	        }
	        return this.$promptInput.val(this.history[this.historyIndex]);
	    }
	
	    // Send a sanitized text to the terminal output, on one line
	    //
	    // lines [String...]
	    print(...lines) {
	        return lines.map(line => this.$output.append(document.createTextNode(line)).append('<br>'));
	    }
	
	    // Send a raw text to the terminal output, on one line
	    //
	    // lines [String...]
	    printHTML(...lines) {
	        return lines.map(line => this.$output.append(line).append('<br>'));
	    }
	
	    scrollToBottom() {
	        // cancel previous animations and start smooth scroll from current position
	        //    console.log "scroll #{@$output[0].scrollHeight}"
	        this.$output.stop();
	        return this.$output.animate({ scrollTop: this.$output[0].scrollHeight }, 200, "swing");
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
	        this.print(`> ${ commandLine }`);
	
	        // interpret command if you can, else show error message
	        try {
	            var syntaxTree = this.interpreter.parse(commandLine);
	        } catch (error) {
	            if (error instanceof _error.TerminalSyntaxError) {
	                // normal in-game error, the player typed something wrong
	                this.print(error.message); // clean in-game message
	                this.scrollToBottom();
	                return; // leave, we don't interpret the command
	            } else {
	                // unexpected error from the game program
	                this.print(error.message); // clean in-game message (actually fun to see real program error in the game)
	                this.scrollToBottom();
	                throw error; // allows to debug in console even if message is also displayed in game terminal
	            }
	        }
	
	        try {
	            // pass the current process to execute the syntax tree (here, the terminal object)
	            // so that the child process can print to output, open another interpreter inside, etc.
	            this.interpreter.execute(syntaxTree, this);
	        } catch (error) {
	            // execute should only throw actual errors if any
	            this.print(error.message); // clean in-game message
	            this.scrollToBottom();
	            throw error; // allows to debug in console even if message is also displayed in game terminal
	        }
	
	        this.scrollToBottom();
	    }
	
	    // Clear the output content, but keep the input history
	    clearCommand() {
	        return this.$output.empty();
	    }
	
	    // Show available commands information
	    helpCommand() {
	        return this.print("List of available commands:", "clear -- clear the console output", "help -- show this help menu", "ls -- show files and subdirectories in current directory", "cd -- navigate to subdirectory", "cat <file> -- print content of text file to console output", "connect <domain> -- connect to a domain by URL or IP");
	    }
	
	    // Show files and subdirectories in directory at relative path
	    //
	    // @param pathname [String] relative path with 'a/b' format
	    lsCommand(pathname) {
	        // IMPROVE: support pathname
	        return this.currentDirectory.children.map(file => this.print(file.toString()));
	    }
	
	    // Enter directory at relative path
	    //
	    // @param pathname [String] relative path with 'a/b' format
	    cdCommand(pathname) {
	        // on unix, cd with no arguments sends back to the user's home directory; there is no 'root' home dir so let's go to /
	        if (pathname == null) {
	            var newDirectoryStack = [this.directoryStack[0]]; // only keep ROOT directory (not root home); works if no other ref to this array
	        } else {
	            let pathChain = pathname.split('/');
	            var newDirectoryStack = this.directoryStack.slice(); // work on stack copy in case it fails in the middle
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
	                    if (nextDir == null) {
	                        throw new Error(`cd: ${ pathname }: No such directory`);
	                    }
	                    newDirectoryStack.push(nextDir);
	                }
	            }
	        }
	
	        return this.directoryStack = newDirectoryStack; // array ref changes here again
	    }
	
	    // Print text file content to output
	    //
	    // @param filename [String] name of a text file to read
	    catCommand(filename) {
	        if (filename == null) {
	            // unix cat open stream for free input, but we do not need this in the game
	            throw new _error.TerminalSyntaxError("The cat command requires 1 argument: the name of a text (.txt) file");
	        }
	
	        if (filename.slice(-4) === ".txt") {
	            // remove .txt extension for the search by name
	            filename = filename.slice(0, -4);
	        }
	
	        // IMPROVE: support path + filename
	        let textFile = this.currentDirectory.getFile(_server.TextFile, filename);
	        if (textFile == null) {
	            throw new Error(`cat: ${ filename }: No such file`);
	        }
	        return this.printText(textFile);
	    }
	
	    // Connect to server by domain URL or IP
	    //
	    // @param address [String] domain URL or IP address
	    connectCommand(address) {
	        if (address == null) {
	            throw new _error.TerminalSyntaxError("The connect command requires 1 argument: the domain URL or IP");
	        }
	        let server = _server.Server.find(address);
	        if (server == null) {
	            return this.print(`Could not resolve hostname / IP ${ address }`);
	        } else {
	            this.connect(server);
	            return this.print(`Connected to ${ address }`);
	        }
	    }
	}exports.Terminal = Terminal;
	;
	
	// Class responsible for syntax analysis (parsing) and execution
	// of the command-lines in the terminal
	class CommandInterpreter {
	
	    // @param terminal [Terminal] terminal receiving the commands
	    constructor(terminal) {
	        this.terminal = terminal;
	    }
	
	    // Parse a command and return a syntax tree made of tokens
	    // Throw an exception if a parsing error occurs
	    //
	    // commandLine [string] command sent to shell
	    parse(commandLine) {
	        console.log(`[TERMINAL] Parse '${ commandLine }'`);
	        // multi-word analysis
	        // trim whitespaces and separate command from arguments
	        let [command, ...commandArgs] = commandLine.trim().split(/\s+/);
	        if (command === "") {
	            return new SyntaxTree([CommandToken.void, []]);
	        }
	        if (!(command in CommandToken)) {
	            throw new _error.TerminalSyntaxError(`${ command }: command not found`);
	        }
	        return new SyntaxTree([CommandToken[command], commandArgs]);
	    }
	
	    // Execute command with arguments provided in syntax tree
	    // All commands interpretation consist in giving semantics to each argument and delegating back to the terminal
	    //
	    // @param syntaxTree [SyntaxTree] : multi-dimensional array containing the command line tokens
	    // @param terminal [Terminal] : represents the parent process
	    execute(syntaxTree, terminal) {
	        console.log(`[TERMINAL] Execute ${ syntaxTree }`);
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
	
	class SyntaxTree {
	
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
	        return `${ this.nodes[0] } -> ${ this.nodes[1].join(', ') }`;
	    }
	}exports.SyntaxTree = SyntaxTree;
	;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Table = exports.DatabaseSim = exports.TextFile = exports.RegularFile = exports.Directory = exports.File = exports.FileSystem = exports.Server = undefined;
	
	var _game = __webpack_require__(9);
	
	var _game2 = _interopRequireDefault(_game);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Server simulation
	class Server {
	
	    // TODO: unit tests
	
	    // Return server where address matches either URL or IP
	    static find(address) {
	        // IMPROVE: test 1st character of address, if it's a figure consider it as an IP... maybe
	        let server = this.getByURL(address);
	        if (server != null) {
	            return server;
	        } else {
	            return this.getByIP(address);
	        }
	    }
	
	    // Return server in game data with given url
	    static getByURL(url) {
	        return this.getByIP(game.dns[url]);
	    }
	
	    // Return server in game data with given ip
	    static getByIP(ip) {
	        for (let _ in game.servers) {
	            let server = game.servers[_];
	            if (server.ip === ip) {
	                return server;
	            }
	        }
	        return null;
	    }
	
	    // Construct server
	    //
	    // mainURL [string] main domain URL, the most common among those in the domain table
	    // ip [string] IPv6
	    // files [File[]] files at the filesystem root
	    // databaseList [string[]] array of database used by applications on server
	    constructor(mainURL, ip, files, databaseList = []) {
	        // fileSystem [FileSystem] filesystem of the server
	        this.mainURL = mainURL;
	        this.ip = ip;
	        this.fileSystem = new FileSystem(new Directory("root", files));
	        this.databaseList = databaseList;
	    }
	
	    // Return filesystem root
	    getRoot() {
	        return this.fileSystem.root;
	    }
	
	    toString() {
	        return `Server ${ this.mainURL } (${ this.ip })`;
	    }
	}exports.Server = Server;
	;
	
	class FileSystem {
	
	    // @param root [File] filesystem root directory
	    constructor(root) {
	        this.root = root;
	    }
	}exports.FileSystem = FileSystem;
	;
	
	// File or directory (file in the UNIX sense)
	class File {}exports.File = File;
	;
	
	class Directory extends File {
	
	    // @param name [String] name of the directory
	    // @param children [File[]] list of children files / directories
	    constructor(name, children = []) {
	        super(); // optional, but removes "this not allowed before super" error in Babel if using preset es2015
	        this.name = name;
	        this.children = children;
	    }
	
	    // Return list of children directories
	    getChildrenDirs() {
	        return this.children.filter(value => value instanceof Directory);
	    }
	
	    // Return child directory with given name, or null if none was found
	    getChildDir(name) {
	        let results = this.children.filter(value => value instanceof Directory && value.name === name);
	        if (results.length === 0) {
	            return null;
	        } else if (results.length === 1) {
	            return results[0];
	        } else {
	            throw new Error(`Error: more than 1 directory found with name '${ name }'`);
	        }
	    }
	
	    // Return array
	    //  getDirChain: (path) =>
	    //    if path == ''
	    //      return [@]
	    //    pathChain = path.split '/'
	    //    currentDir = @  # start from this directory
	    //    for nextDirName in pathChain
	    //  # TODO: support '..'
	    //      if nextDirName != '.'
	    //        currentDir = currentDir.getChildDir nextDirName
	
	
	    // Return directory at relative path from this directory
	    //
	    // @param path [String] path in the "./a/b" format; empty string is equivalent to '.'
	    getDir(path) {
	        // split the path at each '/', but if it is empty create empty chain array manually ("".split returns [''])
	        if (path === '') {
	            return this;
	        }
	        let pathChain = path.split('/');
	        let currentDir = this; // start from this directory
	        for (let i = 0; i < pathChain.length; i++) {
	            // TODO: support '..'
	            let nextDirName = pathChain[i];
	            if (nextDirName !== '.') {
	                currentDir = currentDir.getChildDir(nextDirName);
	                if (currentDir == null) {
	                    return null;
	                } // if path cannot be resolved at this step, STOP, no such directory found
	            }
	        }
	        return currentDir;
	    }
	
	    // Return child file of given class with given name, or null if none was found
	    //
	    // @param fileClass [function] the constructor function representing the target class (e.g. TextFile)
	    getFile(fileClass, name) {
	        let results = this.children.filter(value => value instanceof fileClass && value.name === name);
	        if (results.length === 0) {
	            return null;
	        } else if (results.length === 1) {
	            return results[0];
	        } else {
	            throw new Error(`Error: more than 1 file of type ${ fileClass } found with name '${ name }'`);
	        }
	    }
	
	    // Add file/directory in relative path from this directory
	    //
	    // @param file [File] file to add
	    addFile(file, path = '') {
	        return this.getDir(path).children.push(file);
	    }
	
	    toString() {
	        return this.name;
	    }
	}exports.Directory = Directory;
	;
	
	// Non-directory file
	class RegularFile extends File {}exports.RegularFile = RegularFile;
	;
	
	// Text file, assumed extension .txt
	class TextFile extends RegularFile {
	
	    // @param name [String] name of the file (without extension)
	    // @param content [String] text content
	    // @param onReadEvent [String] name of the event called when the file is read by the player in the terminal
	    constructor(name, content, onReadEvent = null) {
	        super();
	        this.name = name;
	        this.content = content;
	        this.onReadEvent = onReadEvent;
	    }
	    // TODO: put localization helper here
	
	    toString() {
	        return this.name + ".txt";
	    }
	}exports.TextFile = TextFile;
	;
	
	class DatabaseSim {
	
	    // Construct database with tables
	    constructor(tables = []) {
	        this.tables = tables;
	    }
	}exports.DatabaseSim = DatabaseSim;
	;
	
	class Table {
	
	    // Construct table from row entries
	    constructor(rows = []) {
	        this.rows = rows;
	    }
	}exports.Table = Table;
	;
	
	//# Computer process simulation
	//class @Process
	//
	//  execute: (terminal) =>
	//

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = class {
	
	    constructor() {
	        this.dialogueLines = null;
	        this.dialogueNames = null;
	    }
	
	    // @param dialoguesFilename [String] path of the JSON file containing all the localized dialogue lines
	    loadDialogueLines(filepath) {
	        return $.getJSON(filepath, data => this.buildDialogueLines(data)).done(() => console.log("[LOAD] Loaded localized dialogue lines")).fail(() => console.log("[ERROR] Failed loading localized dialogue lines"));
	    }
	
	    // @param dialoguesFilename [String] path of the JSON file containing all the localized dialogue lines
	    loadNames(filepath) {
	        return $.getJSON(filepath, data => this.buildNames(data)).done(() => console.log("[LOAD] Loaded localized names")).fail(() => console.log("[ERROR] Failed loading localized names"));
	    }
	
	    // Build dictionary of dialogue lines from JSON data
	    //
	    // @param data [dictionary] dictionary of dialogue lines
	    buildDialogueLines(data) {
	        //    console.log "[CALL] buildDialogueLines"
	        this.dialogueLines = data;
	    }
	
	    // Build dictionary of names from JSON data
	    //
	    // @param data [dictionary] dictionary of names
	    buildNames(data) {
	        //    console.log "[CALL] buildDialogueLines"
	        return this.dialogueNames = data;
	    }
	
	    // Return localized string for a dialogue or text line, including localized names
	    //
	    // @param lineID [String] line string identifier
	    getLine(lineID) {
	        // split lineID in format "mkX_dY_ZZ" into "mkX/dY/ZZ" the key path to access the dictionary value
	        // (or _tY_ for a text file content)
	        let [missionID, textNo, lineNo] = lineID.split('_');
	        let line = this.dialogueLines[missionID][textNo][lineNo];
	        // TODO: find % without escape backslash before, and convert codenames to localized names
	        //    n = line.search("%")
	        //    line @getName()
	        if (line == null) {
	            throw new Error(`Locale for lineID ${ lineID } not found`);
	        }
	        return line;
	    }
	
	    // Return localized name (currently only character names)
	    //
	    // @param code [String] codename
	    getName(code) {
	        let name = this.dialogueNames[code];
	        if (name == null) {
	            throw new Error(`Locale for codename ${ code } not found`);
	        }
	        return name;
	    }
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _app = __webpack_require__(1);
	
	var _app2 = _interopRequireDefault(_app);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Game settings
	exports.default = class extends _app2.default {
	
	    // [String] game language
	    // TODO: split dialogue and terminal language
	    constructor($screen) {
	        super($screen);
	
	        // jQuery element
	        this.lang = 'fr';
	        this.isLocaleDataLoading = false;
	        this.$settingsForm = $screen.find("form");
	
	        // replace normal submit behavior to apply settings
	        $screen.find(".settings-submit").click(() => this.apply());
	    }
	
	    // [override]
	
	
	    // [bool] is locale data currently loading?
	    checkCanClose() {
	        // prevent closing settings window if locale data is being loaded
	        return !this.isLocaleDataLoading;
	    }
	
	    apply() {
	        this.lang = this.$settingsForm.find("select[name=lang]").val();
	        return this.reloadLocale();
	    }
	
	    // Reload locale based on new language
	    // OPTIMIZE: locale lazy loading (only load once, and when needed, then switch data)
	    reloadLocale() {
	        let isLocaleDataLoading = true;
	        return game.loadLocale(this.lang).done(() => {
	            console.log("[SETTINGS] New Locale loaded");
	            return this.isLocaleDataLoading = false;
	        });
	    }
	};
	;

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// Model classes used in fictive web applications
	
	class User {
	
	    constructor(id, name, password, state) {
	        this.id = id;
	        this.name = name;
	        this.password = password;
	        this.state = state;
	    }
	}exports.User = User;
	;

/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _game = __webpack_require__(9);
	
	var _game2 = _interopRequireDefault(_game);
	
	var _story = __webpack_require__(10);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	$("document").ready(function () {
	    console.log("[DOCUMENT] Ready");
	    return main();
	});
	
	function main() {
	    // create game as global (document) variable
	    window.game = new _game2.default("./");
	
	    // currently app model and window are bound, so need to wait for settings
	    // window to be ready to use settings
	    // see app.coffee for refactoring ideas
	    let loadHTMLDeferred = game.loadModules().done(() => game.initModules());
	    let dataDeferred = game.loadData("data/dialoguegraphs.json");
	
	    // start story
	    let storyGraph = new _story.StoryGraph();
	    storyGraph.addNode(new _story.StoryNode("initial", function () {
	        game.playBGM();
	        return setTimeout(() => game.phone.startDialogueByName("mission-tutorial.proposal"), 2000);
	    }, ["to-be-continued"]));
	    storyGraph.addNode(new _story.StoryNode("to-be-continued"));
	
	    return $.when(loadHTMLDeferred, dataDeferred).done(() => game.loadLocale(game.settings.lang)).done(() => game.story.start(storyGraph));
	}

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map