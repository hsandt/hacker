# Base class for window applications inside the game
class @App

  # [HubDevice] hub device
  device: null

  # $screen [jQuery] modular window screen element
  constructor: (@$screen) ->

  # Called when the player focuses on this application, return boolean
  # MUST return true to propagate and have expected opening effect, false to stop propagation
  onOpen: =>
    console.log "[APP] #{@} onOpen"
    return true

  # Called when the player leaves the application window
  # MUST return true to propagate and have expected closing effect, false to stop propagation
  onClose: =>
    console.log "[APP] #{@} onClose"
    return true
