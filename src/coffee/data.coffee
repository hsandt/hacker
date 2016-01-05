class @GameData

  missions:
    "mission01": new Mission "mission01", (->), (->)

  eventFunctions:
    "mission-test.start": ->
      game.servers["moogle"].getRoot().getDir('home/john').addFile(new TextFile "mail",
      ["mt1_t1_01", "mt1_t1_02"].map(game.locale.getLine).join('\n'),
      "mission-test.conclusion")
    "mission-test.conclusion": ->
      game.phone.startDialogueByName "mission-test.conclusion"
    "mission-tutorial.conclusion": ->
      game.phone.startDialogueByName "mission-tutorial.conclusion"

  constructor: () ->

  # @param dialogueFilename [String] path of the JSON file containing all dialogues
  loadDialogueGraphs: (dialogueGraphsFilename) =>
    $.getJSON(dialogueGraphsFilename, @buildDialogueGraphs)
      .done(-> console.log "[LOAD] Loaded dialogue graphs")
      .fail(-> console.log "[LOAD] Failed loading dialogue graphs")

  # Build dictionary of dialogue graphs from JSON data
  #
  # @param data [dictionary] dictionary with JSON data
  buildDialogueGraphs: (data) =>
#    console.log "[CALL] buildDialogueGraphs"
    @dialogueGraphs = {}
    for dialogueName, dialogueData of data
      @dialogueGraphs[dialogueName] = new DialogueGraph dialogueName
      # first pass: fill dialogue by identifying successors and choices with name only
      # events have already been defined so you can link them already
      for nodeName, nodeData of dialogueData
        switch nodeData.type
          when "text"
            node = new DialogueText nodeName, nodeData.lines, nodeData.successor, nodeData.speaker
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
        @dialogueGraphs[dialogueName].addNode node
      # second pass: link node with successor/choices by name, since now all nodes have been defined
      # this requires more computation during building process but ensures all names are resolved
      for nodeName, node of @dialogueGraphs[dialogueName].nodes
        if node.type in ["text", "choice", "event", "wait"] and node.successor?
          successor = @dialogueGraphs[dialogueName].getNode node.successor
          if not successor?
            throw new Error "Successor #{node.successor} not found in dialogue #{dialogueName}"
          node.successor = successor  # from String to DialogueNode
        else if node.type == "choice hub"
          for choiceName, i in node.choices
            choice =  @dialogueGraphs[dialogueName].getNode choiceName
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
