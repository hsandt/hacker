# Base class for window applications inside the game
class @App

  # [String] Lower case app identifier, used to differentiate subclasses such as "phone" vs "irc"
  appName: "N/A"

  # [HubDevice] hub device
  device: null

  # $screen [jQuery] modular window screen element
  constructor: (@$screen) ->

  # Return true if the application can be opened now
  checkCanOpen: =>
    return true

  # Return true if the application can be closed now
  checkCanClose: =>
    return true

  # Called when the player focuses on this application
  onOpen: =>
    console.log "[APP: #{@appName}] onOpen"

  # Called when the player leaves the application window
  onClose: =>
    console.log "[APP: #{@appName}] onClose"
