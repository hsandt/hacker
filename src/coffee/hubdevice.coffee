# Base class for devices on the hub attached to a given app
class @HubDevice

  # $device [jQuery] device element on the hub for this app
  constructor: (@$device) ->

  # Send notification cue on this device if state is "on", stop notification cue else
  notify: (state = "on") =>
    console.log "notify (state = #{state}) has not been defined on device #{@}"

