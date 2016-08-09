# Game settings
class @Settings extends App

  # [String] game language
  # TODO: split dialogue and terminal language
  lang: 'fr'

  # [bool] is locale data currently loading?
  isLocaleDataLoading: false

  constructor: ($screen) ->
    super $screen

    # jQuery element
    @$settingsForm = $screen.find "form"

    # replace normal submit behavior to apply settings
    $screen.find(".settings-submit").click => @apply()

  # [override]
  checkCanClose: =>
    # prevent closing settings window if locale data is being loaded
    return not @isLocaleDataLoading

  apply: =>
    @lang = @$settingsForm.find("select[name=lang]").val()
    @reloadLocale()

  # Reload locale based on new language
  # OPTIMIZE: locale lazy loading (only load once, and when needed, then switch data)
  reloadLocale: =>
    isLocaleDataLoading = true
    game.loadLocale(@lang).done =>
      console.log "[SETTINGS] New Locale loaded"
      @isLocaleDataLoading = false
