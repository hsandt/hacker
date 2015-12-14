@Game =
  # associative array of event [string]: hasHappened [bool]
  events:
    "player_is_dead": false

  # associative array of serverID [string]: server [Server]
  servers:
    "local": new Server "N/A", "456.231.24.57",
      ["home"]
    "google": new Server "google.com", "256.241.23.02",
      ["etc", "home", "var"],
      [
        new DatabaseSim [
          new Table "user_table",
            0: new Google.User 0, "john", "dd6x5few961few68fq4wd6", "California"
        ]
      ]

  # domain table of URL [string]: IP [string]
  dns:
    "google.com": "256.241.23.02"
