import {DialogueGraph, DialogueText, DialogueChoiceHub, DialogueChoice, DialogueEvent, DialogueWait} from "./chat";
import Mission from "./mission";

export class GameData {

    // GameData is a singleton, so keep the data as instance and not static for now

    // default attributes require babel-plugin-transform-class-properties
    missions = {"mission01": new Mission("mission01", (function() {}), (function() {}))};

    eventFunctions = {
        ["mission-test.start"]() {
            return game.servers["moogle"].getRoot().getDir('home/john').addFile(new TextFile("mail",
                ["mt1_t1_01", "mt1_t1_02"].map(game.locale.getLine).join('\n'),
                "mission-test.conclusion"));
        },
        ["mission-test.conclusion"]() {
            // FIXME: can finish the game by reading the correct file from the beginning
            return game.phone.startDialogueByName("mission-test.conclusion");
        },
        ["mission-tutorial.conclusion"]() {
            return game.phone.startDialogueByName("mission-tutorial.conclusion");
        }
    };

    constructor() {
        // this.buildDialogueGraphs = this.buildDialogueGraphs.bind(this);
    }

    // @param dialogueFilename [String] path of the JSON file containing all dialogues
    loadDialogueGraphs(dialogueGraphsFilename) {
        return $.getJSON(dialogueGraphsFilename, data => this.buildDialogueGraphs(data))
            .done(() => console.log("[LOAD] Loaded dialogue graphs"))
            .fail(() => console.log("[ERROR] Failed loading dialogue graphs"));
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
            this.dialogueGraphs[dialogueName] = new DialogueGraph(dialogueName);
            // first pass: fill dialogue by identifying successors and choices with name only
            // events have already been defined so you can link them already
            for (let nodeName of Object.keys(dialogueData)) {
                let nodeData = dialogueData[nodeName];
                switch (nodeData.type) {
                    case "text":
                        var node = new DialogueText(nodeName, nodeData.lines, nodeData.successor, nodeData.speaker);
                        break;
                    case "choice hub":
                        node = new DialogueChoiceHub(nodeName, nodeData.choices);
                        break;
                    case "choice":
                        node = new DialogueChoice(nodeName, nodeData.lines, nodeData.successor);
                        break;
                    case "event":
                        node = new DialogueEvent(nodeName, this.eventFunctions[nodeData.eventName], nodeData.successor);
                        break;
                    case "wait":
                        node = new DialogueWait(nodeName, 1000 * nodeData.time, nodeData.successor);  // s to ms conversion
                        break;
                    default:
                        throw new Error(`Node ${nodeName} has unknown type ${nodeData.type}`);
                }
                this.dialogueGraphs[dialogueName].addNode(node);
            }
            // second pass: link node with successor/choices by name, since now all nodes have been defined
            // this requires more computation during building process but ensures all names are resolved
            for (let nodeName of Object.keys(this.dialogueGraphs[dialogueName].nodes)) {
                node = this.dialogueGraphs[dialogueName].nodes[nodeName]
                if (['text', 'choice', 'event', 'wait'].includes(node.type) && node.successor != null) {
                    let successor = this.dialogueGraphs[dialogueName].getNode(node.successor);
                    if (successor == null) {
                        throw new Error(`Successor ${node.successor} not found in dialogue ${dialogueName}`);
                    }
                    node.successor = successor;  // from String to DialogueNode
                } else if (node.type === "choice hub") {
                    for (let [i, choiceName] of node.choices.entries()) {
                        let choice =  this.dialogueGraphs[dialogueName].getNode(choiceName);
                        if (choice == null) {
                            throw new Error(`Choice ${choiceName} not found in dialogue ${dialogueName}`);
                        }
                        node.choices[i] = choice;  // from String to DialogueNode
                    }
                }
            }
        }
    }
}

/* TEMPLATE for dialogue.json
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
