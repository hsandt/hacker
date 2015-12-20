/**
 * Created by wing on 15/12/19.
 */
(function() {

    this.initHub = function() {

        console.log("Init HUB");

        // bind "open modular window" event to each monitor
        var dlgtrigger = document.querySelectorAll('[data-dialog]');
        for (var i = 0; i < dlgtrigger.length; i++) {
            //console.log(i);
            somedialog = document.getElementById(dlgtrigger[i].getAttribute('data-dialog'));
            dlg = new DialogFx(somedialog);


            dlgtrigger[i].addEventListener('click', dlg.toggle.bind(dlg));
        }

        // activate parallax from mouse
        $('#parallax .parallax-layer')
            .parallax({
                mouseport: $('#parallax')
            });

    };

}).call(this);
