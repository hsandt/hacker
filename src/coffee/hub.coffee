class @Hub

  # [String: DialogFx] associative array of dialogs, one per app
  dialogs: {}

  # state vars
  currentAppName: 'none'  # current app name: 'none', 'terminal', 'chat', etc.

  constructor: ->
    console.log("Construct HUB")

    self = @

    # bind "open modular window" event to each monitor
    dlgtrigger = $('[data-dialog]')
    for element, i in dlgtrigger.toArray()
    #      console.log(i)
        dialogAppName = element.getAttribute 'data-dialog'
        $dialog = $('#' + dialogAppName + 'Dialog')[0]
        # REFACTOR: let DialogFx have name member and use that instead of currentAppName + do()
        dialogFx = self.dialogs[dialogAppName] = new DialogFx $dialog,
          onOpenDialog: do (dialogAppName) -> (dialog) -> self._onOpen(dialogAppName)
          onCloseDialog: (dialog) -> self._onClose()

        # on click, display app window and open app (focus, etc.)
        $(element).click do (dialogFx) -> -> dialogFx.open()

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


  # Callback when opening application by name: update current app and setup app state
  #
  # @param appName [String]
  _onOpen: (appName) =>
    # check that there is no other app open (TODO: except notes)
    if @currentAppName == 'none'
      @currentAppName = appName
      game.apps[appName].onOpen()
    else
      console.warn "[WARNING] Opening app #{appName} but app #{@currentAppName} is already open"

  # Callback when closing current application: set current app to 'none' and clean app state
  _onClose: =>
    if @currentAppName != 'none'
      game.apps[@currentAppName].onClose()
      @currentAppName = 'none'
    else
      console.warn "[WARNING] Closing current app but no app is currently open"
