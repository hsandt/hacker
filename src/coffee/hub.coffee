class @Hub

  dialogs: {}

  constructor: ->
    console.log("Construct HUB")

    _this = @

    # bind "open modular window" event to each monitor
    dlgtrigger = $('[data-dialog]')
    for element, i in dlgtrigger.toArray()
    #      console.log(i)
        dialogAppName = element.getAttribute 'data-dialog'
        somedialog = $('#' + dialogAppName + 'Dialog')[0]
        _this.dialogs[dialogAppName] = new DialogFx somedialog
        # on click, display app window and open app (focus, etc.)
        console.log dialogAppName
        $(element).click do (dialogAppName) -> -> _this.open dialogAppName

#    dlgtrigger.each ((i, element) ->
#        $.proxy ->
#    #      console.log(i)
#          dialogAppName = element.getAttribute 'data-dialog'
#          somedialog = $('#' + dialogAppName + 'Dialog')[0]
#          _this.dialogs[dialogAppName] = new DialogFx somedialog
#          # on click, display app window and open app (focus, etc.)
#          $(element).click -> _this.open dialogAppName)

    # activate parallax from mouse
    $('#parallax .parallax-layer')
    .parallax
      mouseport: $('#parallax')


  # Open application by name
  #
  # @param appName [String]
  open: (appName) =>
    @dialogs[appName].toggle()

