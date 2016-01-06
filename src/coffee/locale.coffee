class @Locale

  constructor: ->

  # @param dialoguesFilename [String] path of the JSON file containing all the localized dialogue lines
  loadDialogueLines: (dialoguesFilename) =>
    $.getJSON(dialoguesFilename, @buildDialogueLines)
      .done(-> console.log "[LOAD] Loaded localized dialogue lines")
      .fail(-> console.log "[LOAD] Failed loading localized dialogues")


# Build dictionary of dialogue lines from JSON data
  #
  # @param data [dictionary] dictionary of dialogue lines with JSON data
  buildDialogueLines: (data) =>
#    console.log "[CALL] buildDialogueLines"
    @dialogueLines = data

  # Return localized string for a dialogue or text line
  #
  # @param lineID [String] line string identifier
  getLine: (lineID) =>
    # split lineID in format "mkX_dY_ZZ" into "mkX/dY/ZZ" the key path to access the dictionary value
    # (or _tY_ for a text file content)
    [missionID, textNo, lineNo] = lineID.split '_'
    line = @dialogueLines[missionID][textNo][lineNo]
    if not line?
      throw new Error "Locale for lineID #{lineID} not found"
    line

