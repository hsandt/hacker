class @Localize

  # @param dialoguesFilename [String] path of the JSON file containing all the localized dialogue lines
  constructor: ->

  loadDialogueLines: (dialoguesFilename) =>
    $.getJSON(dialoguesFilename, @buildDialogueLines).done ->
      console.log "[LOAD] Loaded localized dialogue lines"

  # Build dictionary of dialogue lines from JSON data
  #
  # @param data [dictionary] dictionary of dialogue lines with JSON data
  buildDialogueLines: (data) =>
    @dialogueLines = data

  # Return localized string for a dialogue or text line
  #
  # @param lineID [String] line string identifier
  getLine: (lineID) =>
    # split lineID in format "mkX_dY_ZZ" into "mkX/dY/ZZ" the key path to access the dictionary value
    # (or _tY_ for a text file content)
    [missionID, textNo, lineNo] = lineID.split '_'
    @dialogueLines[missionID][textNo][lineNo]
