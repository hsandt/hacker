class @GameData

  missions:
    "mission01": new Mission "mission01", (->), (->)

  eventFunctions:
    "test.start": ->
      game.servers["moogle"].getRoot().getDir('home/john').addFile(new TextFile "mail",
      "I went to the cinema the other day. If you could see my boss, he was just crazy!\n
      I told him I had an important meeting with an ex-collaborator.",
      -> game.chat.startDialogueByName "test.conclusion")


  # @param dialogueFilename [String] path of the JSON file containing all dialogues
  constructor: (dialogueFilename) ->
    $.getJSON dialogueFilename, @buildDialogues

  # Build dictionary of dialogue graphs from JSON data
  #
  # @param data [dictionary] dictionary with JSON data
  buildDialogues: (data) =>
    @dialogues = {}
    for dialogueName, dialogueData of data
      @dialogues[dialogueName] = new DialogueGraph dialogueName
      # first pass: fill dialogue by identifying successors and choices with name only
      # events have already been defined so you can link them already
      for nodeName, nodeData of dialogueData
        switch nodeData.type
          when "text"
            node = new DialogueText nodeName, nodeData.lines, nodeData.successor
          when "choice hub"
            node = new DialogueChoiceHub nodeName, nodeData.choices
          when "choice"
            node = new DialogueChoice nodeName, nodeData.lines, nodeData.successor
          when "event"
            node = new DialogueEvent nodeName, @eventFunctions[nodeData.eventName], nodeData.successor
          when "wait"
            node = new DialogueWait nodeName, 1000 * nodeData.time, nodeData.successor  # s to ms conversion
          else
            throw new Error "Node #{nodeName} has unknown type #{nodeData.type}"
        @dialogues[dialogueName].addNode node
      # second pass: link node with successor/choices by name, since now all nodes have been defined
      # this requires more computation during building process but ensures all names are resolved
      for nodeName, node of @dialogues[dialogueName].nodes
        if node.type in ["text", "choice", "event", "wait"] and node.successor?
          successor = @dialogues[dialogueName].getNode node.successor
          if not successor?
            throw new Error "Successor #{node.successor} not found in dialogue #{dialogueName}"
          node.successor = successor  # from String to DialogueNode
        else if node.type == "choice hub"
          for choiceName, i in node.choices
            choice =  @dialogues[dialogueName].getNode choiceName
            if not choice?
              throw new Error "Choice #{choiceName} not found in dialogue #{dialogueName}"
            node.choices[i] = choice  # from String to DialogueNode

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
