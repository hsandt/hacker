@gameData = {}

gameData.missions =
  "mission01": new Mission "mission01", (->), (->)

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

gameData.dialogues =
  "m01.d02": dialogueGraph2
