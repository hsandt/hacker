# Server simulation
class @Server

  # TODO: unit tests

  # Return server where address matches either URL or IP
  @find = (address) ->
    # IMPROVE: test 1st character of address, if it's a figure consider it as an IP... maybe
    server = @getByURL address
    if server?
      server
    else
      @getByIP address

  # Return server in game data with given url
  @getByURL = (url) ->
    @getByIP(Game.dns[url])

  # Return server in game data with given ip
  @getByIP = (ip) ->
    for _, server of Game.servers
      if server.ip == ip
        return server
    return null

  # Construct server
  #
  # mainURL [string] main domain URL, the most common among those in the domain table
  # ip [string] IPv6
  # databaseList [string[]] array of database used by applications on server
  constructor: (@mainURL, @ip, @files, @databaseList = []) ->

  toString: =>
    "Server #{@mainURL} (#{@ip})"

class @DatabaseSim

  # Construct database with tables
  constructor: (@tables = []) ->


class @Table

  # Construct table from row entries
  constructor: (@rows = []) ->

# Computer process simulation
class @Process

  execute: (terminal) =>

