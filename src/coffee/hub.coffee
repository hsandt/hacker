class @Hub

  constructor: ->
    console.log("Construct HUB")
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
