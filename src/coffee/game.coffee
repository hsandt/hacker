@Game =
  events:
    # put list of events with string key and bool value, true for "has happened"
    "player_is_dead": false

  servers:
    "google": new Server "google.com", "256.241.23.02", [
      new DatabaseSim [
        new Table "user_table",
          0: new User 0, "john", "dd6x5few961few68fq4wd6", "California"
      ]
    ]
