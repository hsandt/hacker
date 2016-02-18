# Base class for window applications inside the game
# REFACTOR: split app model and app screen behavior in 2 classes
# App model contains all basic data and "blind" methods and can be initialized immediately
# App screen behavior uses takes care of jQuery binding stuff and is initialized
# after deferred app module HTML is done
# For instance, Locale could be loaded from language settings immediately,
# without having to wait for the settings window to be loaded
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
