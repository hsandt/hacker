export default class {

    constructor($screens, $desk) {
        this.$screens = $screens;
        this.$desk = $desk;

        // [String: DialogFx] dictionary of dialogs, one per app
        this.dialogs = {};

        // state vars
        this.currentAppName = 'none';  // current app name: 'none' if none is open, 'terminal', 'chat', etc.

        // add images from script to ensure path is correct
        let screensImage = new Image();
        screensImage.src = game.imagePath + 'hub/screens.png';
        this.$screens.prepend(screensImage);

        let deskImage = new Image();
        deskImage.src = game.imagePath + 'hub/desk.png';
        this.$desk.prepend(deskImage);

        // bind "open modular window" event to each monitocr
        let dlgtrigger = $('[data-dialog]');
        let iterable = dlgtrigger.toArray();
        for (let i = 0; i < iterable.length; i++) {
            //      console.log(i)
            let element = iterable[i];
            let dialogAppName = element.getAttribute('data-dialog');
            let dialog = $(`#${dialogAppName}Dialog`)[0];
            // REFACTOR: let DialogFx have name member and use that instead of currentAppName + do()
            let dialogFx = this.dialogs[dialogAppName] = new DialogFx(dialog, {
                // IMPROVE: in ES6, maybe no need to pass local vars, they may be transferred like "this" (check out)
                //     onOpenDialog: (dialogAppName => dialog => this._onOpen(dialogAppName))(dialogAppName),
                    onOpenDialog: dialog => this._onOpen(dialogAppName),
                    onCloseDialog: dialog => this._onClose()
                }
            );

            // on click, display app window and open app (focus, etc.)
            $(element).click((dialogFx => () => dialogFx.open())(dialogFx));
        }

//    dlgtrigger.each ((i, element) ->
//        $.proxy ->
//    #      console.log(i)
//          dialogAppName = element.getAttribute 'data-dialog'
//          somedialog = $('#' + dialogAppName + 'Dialog')[0]
//          _this.dialogs[dialogAppName] = new DialogFx somedialog
//          # on click, display app window and open app (focus, etc.)
//          $(element).click -> _this.open dialogAppName)

        // activate parallax from mouse
        $('#parallax .parallax-layer')
            .parallax({
                mouseport: $('#parallax')});
    }


    // Callback when opening application by name: update current app and setup app state
    //
    // @param appName [String]
    _onOpen(appName) {
        // check that there is no other app open (TODO: except notes)
        if (this.currentAppName !== 'none') {
            console.warn(`[WARNING] Trying to open app ${appName} but app ${this.currentAppName} is already open`);
            return false;
        }

        let app = game.apps[appName];

        if (app.checkCanOpen()) {
            this.currentAppName = appName;
            app.onOpen();  // call this after setting the new app name, it may need it
            return true;
        }

        return false;
    }

    // Callback when closing current application: set current app to 'none' and clean app state
    _onClose() {
        if (this.currentAppName === 'none') {
            console.warn("[WARNING] Trying to close current app but no app is currently open");
            return false;
        }

        let app = game.apps[this.currentAppName];

        if (app.checkCanClose()) {
            app.onClose();  // call this before resetting app name, it may need the old one
            this.currentAppName = 'none';
            return true;
        }

        return false;
    }
};
