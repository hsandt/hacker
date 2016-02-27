class @Hub

  # [String: DialogFx] dictionary of dialogs, one per app
  dialogs: {}

  # state vars
  currentAppName: 'none'  # current app name: 'none' if none is open, 'terminal', 'chat', etc.

  constructor: (@$screens, @$desk) ->
    self = @

    # add images from script to ensure path is correct
    screensImage = new Image
    screensImage.src = game.imagePath + 'hub/screens.png'
    @$screens.prepend screensImage

    deskImage = new Image
    deskImage.src = game.imagePath + 'hub/desk.png'
    @$desk.prepend deskImage

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
    if @currentAppName != 'none'
      console.warn "[WARNING] Trying to open app #{appName} but app #{@currentAppName} is already open"
      return false

    app = game.apps[appName]

    if app.checkCanOpen()
      @currentAppName = appName
      app.onOpen()  # call this after setting the new app name, it may need it
      return true

    return false

  # Callback when closing current application: set current app to 'none' and clean app state
  _onClose: =>
    if @currentAppName == 'none'
      console.warn "[WARNING] Trying to close current app but no app is currently open"
      return false

    app = game.apps[@currentAppName]

    if app.checkCanClose()
      app.onClose()  # call this before resetting app name, it may need the old one
      @currentAppName = 'none'
      return true

    return false
