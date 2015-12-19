/**
 * Created by wing on 15/12/19.
 */
(function() {

    this.initHub = function() {

        console.log("HUB ready function");

        var dlgtrigger = document.querySelectorAll('[data-dialog]');
        for (var i = 0; i < dlgtrigger.length; i++) {
            console.log(i);
            somedialog = document.getElementById(dlgtrigger[i].getAttribute('data-dialog'));
            dlg = new DialogFx(somedialog);


            dlgtrigger[i].addEventListener('click', dlg.toggle.bind(dlg));
        }

    };

}).call(this);
