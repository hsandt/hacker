// Abstract base class for IRC and phone apps
export class Chat extends App {

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
            console.log(`[CHAT] Cannot close ${this.appName}, player character is typing`);
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
        if (game.hub.currentAppName !== this.appName) {  // "irc" for IRC, "phone" for the phone
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
        return this.$chatHistory.animate({scrollTop: this.$chatHistory[0].scrollHeight}, 200, "swing");
    }

    // Show available replies for the player
    //
    // @param choices [DialogueChoice[]] list of choice nodes
    showChoices(choices) {
        // show all choices in input area from template
        return choices.forEach(choice => {
                if (choice == null) {
                    throw new Error(`Could not find choice node ${choice.name} in dialogue ${dialogueGraph.name}`);
                }
                // create <li> jQuery element from template
                let localizedLine = game.locale.getLine(choice.lines[0]);  // first line is representative for choice
                let choiceEntry = $(this.messageChoiceTemplate({choiceMessage: localizedLine}));
                // add onclick event with choice inside forEach's closure
                choiceEntry.click(() => this.choose(choice));
                return this.$chatInputList.append(choiceEntry);
            }
        );
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
                    this.mustType = false;  // if chat was closed before and mustType flag was set, revert it now
                } else {
                    console.log(`[CHAT] ${this.appName} is closed, will type message next time chat is entered`);
                    this.mustType = true;
                    return;
                }
            }

            // prepare timer to send or receive future next message
            return setTimeout((() => this.processNextMessage()), nextMessage.sendTime);

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



export class DialogueGraph {

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
            console.warn(`[DIALOGUE] Node ${name} not found`);
            return null;
        }
        return this.nodes[name];
    }

    toString() {
        return `DialogueGraph ${this.name}`;
    }
}





export class DialogueNode {

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



export class DialogueText extends DialogueNode {

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
        return `DialogueText ${this.name} -> ${this.successor != null ? this.successor.name : "END"}`
    }

    onEnter(chat) {
        // for TEXT nodes, either send or receive all messages in the node, depending on the sender
        // to do this timely, create a queue of messages waiting to be sent
        for (let i = 0; i < this.lines.length; i++) {
            let lineID = this.lines[i];
            let line = game.locale.getLine(lineID);
            // natural thinking + typing waiting time before sending message, affine of length message
            let typingTime = 1500 + (20 * line.length);
            console.log(`Message thinking/typing time of '${line}': #{typingTime/1000}s`);
            chat.messageQueue.push(new Message(this.speaker, "2027", line, typingTime));
        }

        // process queue by starting with first message
        return chat.prepareNextMessage();
    }
};




export class DialogueChoiceHub extends DialogueNode {

    // @param name [String] string identifier
    // @param choices [DialogueNode] available choices after all messages have been received
    constructor(name, choices) {
        super(name, "choice hub");
        this.choices = choices;
    }

    toString() {
        return `DialogueChoiceHub ${this.name} -> ${this.choices.map(e => e.name).join(", ")}`

    }

    onEnter(chat) {
        // for CHOICE HUB nodes, display available choices
        return chat.showChoices(this.choices);
    }

    onExit(chat) {
        return chat.hideMessageChoices();
    }
}





export class DialogueChoice extends DialogueNode {

    // @param name [String] string identifier
    // @param lines [String[]] messages sent when selecting this choice; the 1st is the one to click on
    // @param successor [DialogueNode] successor node
    constructor(name, lines, successor) {
        super(name, "choice");
        this.lines = lines;
        this.successor = successor;
    }

    toString() {
        return `DialogueChoice ${this.name} '${this.lines.join("; ")}' -> ${this.successor != null ? this.successor.name : "END"}`
    }

    onEnter(chat) {
        // for CHOICE node, remove choices, send choice messages and trigger associated effects
        chat.hideMessageChoices();
        for (let i = 0; i < this.lines.length; i++) {
            let lineID = this.lines[i];
            let line = game.locale.getLine(lineID);
            // typing time is similar to text node calculation, except the 1st message is immediate
            // (assume the player character has typed it while you were thinking which choice to make)
            let typingTime = i === 0 ? 0 : 1500 + (20 * line.length);
            console.log(`Message thinking/typing time of ${line}: ${typingTime/1000}s`);
            chat.messageQueue.push(new Message("pc", "2027", line, typingTime));
        }

        return chat.prepareNextMessage();
    }
}


// Special dialogue node that calls an event function and immediately goes to the next node
export class DialogueEvent extends DialogueNode {

    // @param name [String] string identifier
    // @param eventFunction [Function()] event function to call
    // @param successor [DialogueNode] successor node
    constructor(name, eventFunction, successor) {
        super(name, "event");
        this.eventFunction = eventFunction;
        this.successor = successor;
    }

    toString() {
        return `DialogueEvent ${this.name} -> ${this.successor != null ? this.successor.name : "END"}`
    }

    onEnter(chat) {
        // for EVENT node, call the event function and go to next node
        this.eventFunction();
        return chat.enterDialogueNode(this.successor);
    }
}




// Node to wait between two nodes; useful to emphasize break in a conversation
export class DialogueWait extends DialogueNode {

    // @param name [String] string identifier
    // @param waitTime [float] time to wait in ms
    // @param successor [DialogueNode] successor node
    constructor(name, waitTime, successor) {
        super(name, "wait");
        this.waitTime = waitTime;
        this.successor = successor;
    }

    toString() {
        return `DialogueWait ${this.name}  (${this.waitTime} ms) -> ${this.successor != null ? this.successor.name : "END"}`

    }
    //"DialogueWait #{@name} (#{@waitTime} ms) -> #{if @successor? then @successor.name else "END"}"

    onEnter(chat) {
        // for WAIT node, wait given time and go to next node
        console.log(this.waitTime);
        return setTimeout((() => chat.enterDialogueNode(this.successor)), this.waitTime);
    }
}



// Any kind of message sent in a chat from a character to another
export class Message {

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


export class Phone extends Chat {

    constructor($screen, $device) {
        super($screen);
        this.device = new PhoneDevice($device);
        this.appName = "phone";
    }

}




export class PhoneDevice extends HubDevice {

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
        this.$device.removeClass(`notify-${oppositeState}`);
        this.$device.addClass(`notify-${state}`);

        if (active) {
            return this.phoneAudio.play();

        } else {
            this.phoneAudio.pause();
            return this.phoneAudio.currentTime = 0;
        }
    }
}

