# Base class for devices on the hub attached to a given app
class @HubDevice

  # Is the device sending a visual / audio notification?
  notificationActive: false

  # $device [jQuery] device element on the hub for this app
  constructor: (@$device) ->

  # Send notification cue on this device if active is true, stop notification cue else
  notify: (active = true) =>
    @notificationActive = active
    console.log "[DEVICE] notify (state = #{state}) has not been defined on device #{@}"
