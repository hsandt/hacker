// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Game = (function() {
    Game.dns = {
      "besafe.com": "256.241.23.02"
    };

    Game.prototype.apps = {};

    Game.prototype.bgm = "bgm.mp3";

    Game.prototype.servers = {
      "local": new Server("local", "456.231.24.57", [new Directory("home", [new TextFile("tutorial", "Entrez vos commandes dans le terminal et pressez ENTER\n" + "Utilisez les flèches HAUT et BAS pour retrouver les dernières commandes entrées\n\n" + "connect est une commande très puissante qui infiltre automatiquement un server par son adresse IP ou son URL.\n" + "Les fichiers texte sont affichés par ls avec l'extension .txt. Les autres sont tous des dossiers.\n\n" + "Pour remonter au dossier supérieur, entrez cd ..\n\n" + "Pour lire un fichier texte, entrez cat + nom du fichier. Il n'est pas nécessaire d'écrire l'extension dans le nom du fichier.")])]),
      "besafe": new Server("besafe.com", "256.241.23.02", [new Directory("etc"), new Directory("locate-e", [new Directory("edvige-novik"), new Directory("edward-claes"), new Directory("edward-karlsson"), new Directory("edward-rolland"), new Directory("egino-morel"), new Directory("eileen-bruno"), new Directory("elayne-costa"), new Directory("elise-geraert", [new TextFile("locate-car", "South Region, District 14, Area 2, Building 12 : NewLab Enterprise\nFuel : 83%\nStatus : Scratch on passenger door"), new TextFile("locate-key", "South Region, District 14, Area 3, Building 5 : University of Neus, VR Seminar Room", "mission-tutorial.conclusion"), new TextFile("locate-phone", "South Region, District 14, Area 2, Building 12 : NewLab Enterprise")]), new Directory("elise-giordano"), new Directory("elise-kieffer"), new Directory("eleanor-bonnet"), new Directory("eleanor-petridis")]), new Directory("var")], [
        new DatabaseSim([
          new Table("user_table", {
            0: new Google.User(0, "john", "dd6x5few961few68fq4wd6", "California")
          })
        ])
      ])
    };

    function Game(srcPath) {
      this.srcPath = srcPath;
      this.playBGM = bind(this.playBGM, this);
      this.triggerEvent = bind(this.triggerEvent, this);
      this.getEvent = bind(this.getEvent, this);
      this.loadLocale = bind(this.loadLocale, this);
      this.loadData = bind(this.loadData, this);
      this.initModules = bind(this.initModules, this);
      this.loadModules = bind(this.loadModules, this);
      this.audioPath = this.srcPath + 'audio/';
      this.imagePath = this.srcPath + 'img/';
    }

    Game.prototype.loadModules = function() {
      var modulePath;
      modulePath = game.srcPath + "modules/";
      return $.when($.get(modulePath + "hub.html"), $.get(modulePath + "phone.html"), $.get(modulePath + "terminal.html")).done(function(arg, arg1, arg2) {
        var hubHTML, phoneHTML, terminalHTML;
        hubHTML = arg[0];
        phoneHTML = arg1[0];
        terminalHTML = arg2[0];
        console.log("[LOAD] Loaded Hub, Phone, Terminal HTML");
        $("#content").html(hubHTML);
        $("#phoneContent").html(phoneHTML);
        return $("#terminalContent").html(terminalHTML);
      });
    };

    Game.prototype.initModules = function() {
      if (typeof game === "undefined" || game === null) {
        throw new Error("document.game has not been defined, please create a game instance with @game = new Game first.");
      }
      this.hub = new Hub($("#screens"), $("#desk"));
      this.terminal = this.apps['terminal'] = new Terminal($("#terminal-screen"), $("#terminal-device"));
      this.phone = this.apps['phone'] = new Phone($("#phone-screen"), $("#phone-device"));
      this.apps['chat'] = new App(null, null);
      this.apps['memo'] = new App(null, null);
      this.apps['other'] = new App(null, null);
      this.apps['news'] = new App(null, null);
      return this.story = new Story;
    };

    Game.prototype.loadData = function(dialogueFilename) {
      this.data = new GameData;
      return this.data.loadDialogueGraphs(game.srcPath + dialogueFilename);
    };

    Game.prototype.loadLocale = function(dialoguesFilename) {
      this.locale = new Localize;
      return this.locale.loadDialogueLines(game.srcPath + dialoguesFilename);
    };

    Game.prototype.getEvent = function(name) {
      return this.data.eventFunctions[name];
    };

    Game.prototype.triggerEvent = function(name) {
      return this.data.eventFunctions[name]();
    };

    Game.prototype.playBGM = function() {
      var bgmAudio;
      bgmAudio = new Audio;
      bgmAudio.src = game.audioPath + 'bgm/' + this.bgm;
      return bgmAudio.play();
    };

    return Game;

  })();

}).call(this);
