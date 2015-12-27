# Base class for window applications inside the game
class @App

  # screen [jQuery] modular window screen element
  # device [jQuery] hub device element
  constructor: (@$screen, $device) ->

  # Called when the player focuses on this application
  onOpen: =>
    console.log "[APP] #{@} onOpen"

  # Called when the player leaves the application window
  onClose: =>
    console.log "[APP] #{@} onClose"
