class @GameData

  missions:
    "mission01": new Mission "mission01", (->), (->)

  eventFunctions:
    "test.start": -> game.servers["moogle"].getRoot().getDir('home/john').addFile(new TextFile "mail",
      "I went to the cinema the other day. If you could see my boss, he was just crazy!\n
      I told him I had an important meeting with an ex-collaborator.",
      -> game.chat.startDialogue(game.data.dialogues["test.conclusion"]))


  # @param dialogueFilename [String] path of the JSON file containing all dialogues
  constructor: (dialogueFilename) ->
    $.getJSON dialogueFilename, @buildDialogues

  # Build dictionary of dialogue graphs from JSON data
  #
  # @param data [dictionary] dictionary with JSON data
  buildDialogues: (data) =>
    @dialogues = {}
    for dialogueKey, dialogueData of data
      @dialogues[dialogueKey] = new DialogueGraph
      for nodeName, nodeData of dialogueData
        switch nodeData.type
          when "text"
            node = new DialogueText nodeName, nodeData.lines, nodeData.successor, nodeData.onLastRead
          when "choice hub"
            node = new DialogueChoiceHub nodeName, nodeData.choices
          when "choice"
            node = new DialogueChoice nodeName, nodeData.lines, nodeData.successor
          else
            throw new Error "Node #{nodeName} has unknown type #{nodeData.type}"
        @dialogues[dialogueKey].addNode node

### TEMPLATE for dialogue.json
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
###

dialogueGraph2 = new DialogueGraph


dialogueGraph2.addNode new DialogueNode 0,
  [
    "So, anything new?"
  ],
  [
    new DialogueChoice 0, "Yes, John is a traitor.", 1
    new DialogueChoice 1, "No, John seems to be clean.", 2
  ]

dialogueGraph2.addNode new DialogueNode 1,
  [
    "I knew it! Thanks, here is your reward."
  ],
  [
  ]

dialogueGraph2.addNode new DialogueNode 2,
  [
    "Really? Anyway, here is your reward."
  ],
  [
  ]
