// Game settings
export default class extends App {

    // [String] game language
    // TODO: split dialogue and terminal language
    lang = 'fr';

    // [bool] is locale data currently loading?
    isLocaleDataLoading = false;

    constructor($screen) {
        super($screen);

        // jQuery element
        this.$settingsForm = $screen.find("form");

        // replace normal submit behavior to apply settings
        $screen.find(".settings-submit").click(() => this.apply());
    }

    // [override]
    checkCanClose() {
        // prevent closing settings window if locale data is being loaded
        return !this.isLocaleDataLoading;
    }

    apply() {
        this.lang = this.$settingsForm.find("select[name=lang]").val();
        return this.reloadLocale();
    }

    // Reload locale based on new language
    // OPTIMIZE: locale lazy loading (only load once, and when needed, then switch data)
    reloadLocale() {
        let isLocaleDataLoading = true;
        return game.loadLocale(this.lang).done(() => {
                console.log("[SETTINGS] New Locale loaded");
                return this.isLocaleDataLoading = false;
            }
        );
    }
};
