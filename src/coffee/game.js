export default class {

    // domain table of URL [string]: IP [string]
    static get_dns () {
        return {"besafe.com": "256.241.23.02"};
    }

    apps = {};

    bgm = "bgm.mp3";

    // dictionary of serverID [string]: server [Server]
    servers = {
        "local": new Server("local", "456.231.24.57",
            [
                new Directory("home", [
                    new TextFile("tutorial", "Entrez vos commandes dans le terminal et pressez ENTER\n" +
                        "Utilisez les flèches HAUT et BAS pour retrouver les dernières commandes entrées\n\n" +
                        "connect est une commande très puissante qui infiltre automatiquement un server par son adresse IP ou son URL.\n" +
                        "Les fichiers texte sont affichés par ls avec l'extension .txt. Les autres sont tous des dossiers.\n\n" +
                        "Pour remonter au dossier supérieur, entrez cd ..\n\n" +
                        "Pour lire un fichier texte, entrez cat + nom du fichier. Il n'est pas nécessaire d'écrire l'extension dans le nom du fichier."
                    )
                ])
            ]),
        "besafe": new Server("besafe.com", "256.241.23.02",
            [
                new Directory("etc"),
                new Directory("locate-e", [
                    new Directory("edvige-novik"),
                    new Directory("edward-claes"),
                    new Directory("edward-karlsson"),
                    new Directory("edward-rolland"),
                    new Directory("egino-morel"),
                    new Directory("eileen-bruno"),
                    new Directory("elayne-costa"),
                    new Directory("elise-geraert", [
                        new TextFile("locate-car", "South Region, District 14, Area 2, Building 12 : NewLab Enterprise\nFuel : 83%\nStatus : Scratch on passenger door"),
                        new TextFile("locate-key", "South Region, District 14, Area 3, Building 5 : University of Neus, VR Seminar Room", "mission-tutorial.conclusion"),
                        new TextFile("locate-phone", "South Region, District 14, Area 2, Building 12 : NewLab Enterprise")
                    ]),
                    new Directory("elise-giordano"),
                    new Directory("elise-kieffer"),
                    new Directory("eleanor-bonnet"),
                    new Directory("eleanor-petridis")
                ]),
                new Directory("var")
            ],
            [
                new DatabaseSim([
                    new Table("user_table",
                        {0: new Google.User(0, "john", "dd6x5few961few68fq4wd6", "California")})
                ])
            ])
    };

    // @param srcPath [String] relative path to src folder from main HTML page, ending with '/'
    constructor(srcPath) {
        this.loadModules = this.loadModules.bind(this);
        this.initModules = this.initModules.bind(this);
        this.loadData = this.loadData.bind(this);
        this.loadLocale = this.loadLocale.bind(this);
        this.getEvent = this.getEvent.bind(this);
        this.triggerEvent = this.triggerEvent.bind(this);
        this.playBGM = this.playBGM.bind(this);
        this.srcPath = srcPath;
        this.audioPath = this.srcPath + 'audio/';
        this.imagePath = this.srcPath + 'img/';
    }

    loadModules() {
        let modulePath = game.srcPath + 'modules/';
        return $.when(
            $.get(modulePath + "hub.html"),
            $.get(modulePath + "phone.html"),
            $.get(modulePath + "terminal.html"),
            $.get(modulePath + "settings.html")
            // if assignment destructuration does not work inside function parameter definition, just use hubHTMLArray argument,
            // then get hutHTMLArray[0], etc.
            ).done (function([hubHTML, ...args1], [phoneHTML, ...args2], [terminalHTML, ...args3], [settingsHTML, ...args4]) {
            console.log("[LOAD] Loaded Hub, Phone, Terminal HTML");
            $("#content").html(hubHTML);
            $("#phoneContent").html(phoneHTML);
            $("#terminalContent").html(terminalHTML);
            return $("#settingsContent").html(settingsHTML);
        });
    }

    initModules() {
        console.log("[GAME] initialize modules");
        if (typeof game === 'undefined' || game === null) {
            throw new Error("document.game has not been defined, please create a game instance with @game = new Game first.");
        }
        this.hub = new Hub($("#screens"), $("#desk"));
        this.terminal = this.apps['terminal'] = new Terminal($("#terminal-screen"), $("#terminal-device"));
        this.phone = this.apps['phone'] = new Phone($("#phone-screen"), $("#phone-device"));
        this.apps['memo'] = new App(null, null);
        this.apps['other'] = new App(null, null);
        this.apps['news'] = new App(null, null);
//    @apps['camera'] = new App null, null
        this.settings = this.apps['settings'] = new Settings($("#settings-screen"), $("#settings-device"));

        return this.story = new Story();
    }

    // @param dialogueFilename [String] path from src of the JSON file containing all dialogues
    loadData(dialogueFilename) {
        // [GameData] contains all game story data
        this.data = new GameData();
        return this.data.loadDialogueGraphs(game.srcPath + dialogueFilename);
    }

    // @param lang [String] language code
    loadLocale(lang) {

        this.locale = new Locale();
        // bundle both deferred objects in parallel so that returned value can be reused with .done()
        // REFACTOR: use node.js path library or similar for cleaner path joins
        return $.when(
            this.locale.loadDialogueLines(game.srcPath + `locales/${lang}/dialogues.json`),
            this.locale.loadNames(game.srcPath + `locales/${lang}/names.json`)
        );
    }

    // Return event function by name
    //
    // @param name [String] event name
    getEvent(name) {
        return this.data.eventFunctions[name];
    }

    // Run event function by name
    //
    // @param name [String] event name
    triggerEvent(name) {
        return this.data.eventFunctions[name]();
    }

    playBGM() {
        let bgmAudio = new Audio();
        bgmAudio.src = game.audioPath + 'bgm/' + this.bgm;
        bgmAudio.loop = true;
        return bgmAudio.play();
    }
}
