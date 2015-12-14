# Server simulation
class @Server

  # Construct server
  #
  # url [string] domain URL
  # ip [string] IPv6
  # databaseList [string[]] array of database used by applications on server
  constructor: (@url, @ip, @databaseList) ->


class @DatabaseSim

  # Construct database with tables
  constructor: (@tables = []) ->


class @Table

  # Construct table from row entries
  constructor: (@rows = []) ->

# Computer process simulation
class @Process

  execute: (terminal) =>

