class @Locale

  constructor: ->
    @dialogueLines = null
    @dialogueNames = null

  # @param dialoguesFilename [String] path of the JSON file containing all the localized dialogue lines
  loadDialogueLines: (filepath) =>
    $.getJSON(filepath, @buildDialogueLines)
      .done(-> console.log "[LOAD] Loaded localized dialogue lines")
      .fail(-> console.log "[ERROR] Failed loading localized dialogue lines")

  # @param dialoguesFilename [String] path of the JSON file containing all the localized dialogue lines
  loadNames: (filepath) =>
    $.getJSON(filepath, @buildNames)
      .done(-> console.log "[LOAD] Loaded localized names")
      .fail(-> console.log "[ERROR] Failed loading localized names")

  # Build dictionary of dialogue lines from JSON data
  #
  # @param data [dictionary] dictionary of dialogue lines
  buildDialogueLines: (data) =>
#    console.log "[CALL] buildDialogueLines"
    @dialogueLines = data

  # Build dictionary of names from JSON data
  #
  # @param data [dictionary] dictionary of names
  buildNames: (data) =>
#    console.log "[CALL] buildDialogueLines"
    @dialogueNames = data

  # Return localized string for a dialogue or text line, including localized names
  #
  # @param lineID [String] line string identifier
  getLine: (lineID) =>
    # split lineID in format "mkX_dY_ZZ" into "mkX/dY/ZZ" the key path to access the dictionary value
    # (or _tY_ for a text file content)
    [missionID, textNo, lineNo] = lineID.split '_'
    line = @dialogueLines[missionID][textNo][lineNo]
    # TODO: find % without escape backslash before, and convert codenames to localized names
#    n = line.search("%")
#    line @getName()
    if not line?
      throw new Error "Locale for lineID #{lineID} not found"
    line

  # Return localized name (currently only character names)
  #
  # @param code [String] codename
  getName: (code) =>
    name = @dialogueNames[code]
    if not name?
      throw new Error "Locale for codename #{code} not found"
    name

