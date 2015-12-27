class @Hub

  constructor: ->
    console.log("Construct HUB")

    # get DOM references
    @$phone= $("#phone")
    @$phone.addClass "notify-off"

    # TODO: other apps

    # bind "open modular window" event to each monitor
    dlgtrigger = $('[data-dialog]')
    dlgtrigger.each (i, element) ->
#      console.log(i)
      somedialog = $('#' + element.getAttribute('data-dialog'))[0]
      dlg = new DialogFx(somedialog)
      $(element).click -> dlg.toggle()

    # activate parallax from mouse
    $('#parallax .parallax-layer')
    .parallax(
      mouseport: $('#parallax')
    )

  # Show a visual cue to notify the player that something new has happened
  #
  # @param app [String] name of the application with new events going on
  notifyPhone: =>
    # change color directly or change class so that all styles are in CSS
    @$phone.removeClass "notify-off"
    @$phone.addClass "notify-on"
    phoneAudio = new Audio

    phoneAudio.src = '../../src/audio/sfx/phone_notification.wav'
    phoneAudio.play()


  # Stop showing visual cue for new events
  stopNotifyPhone: =>
    @$phone.removeClass "notify-on"
    @$phone.addClass "notify-off"

