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
    for _, server of game.servers
      if server.ip == ip
        return server
    return null

  # Construct server
  #
  # mainURL [string] main domain URL, the most common among those in the domain table
  # ip [string] IPv6
  # files [File[]] files at the filesystem root
  # databaseList [string[]] array of database used by applications on server
  constructor: (@mainURL, @ip, files, @databaseList = []) ->
    # fileSystem [FileSystem] filesystem of the server
    @fileSystem = new FileSystem new Directory("root", files)

  # Return filesystem root
  getRoot: =>
    @fileSystem.root

  toString: =>
    "Server #{@mainURL} (#{@ip})"


class @FileSystem

  # @param root [File] filesystem root directory
  constructor: (@root) ->

# File or directory (file in the UNIX sense)
class @File


class @Directory extends File

  # @param name [String] name of the directory
  # @param children [File[]] list of children files / directories
  constructor: (@name, @children = []) ->

  # Return list of children directories
  getChildrenDirs: =>
    @children.filter (value) -> value instanceof Directory

  # Return child directory with given name, or null if none was found
  getChildDir: (name) =>
    results = @children.filter (value) -> value instanceof Directory and value.name == name
    if results.length == 0
      return null
    else if results.length == 1
      return results[0]
    else
      throw new Error "Error: more than 1 directory found with name '#{name}'"

  # Return child file of given class with given name, or null if none was found
  #
  # @param fileClass [function] the constructor function representing the target class (e.g. TextFile)
  getFile: (fileClass, name) =>
    results = @children.filter (value) -> value instanceof fileClass and value.name == name
    if results.length == 0
      return null
    else if results.length == 1
      return results[0]
    else
      throw new Error "Error: more than 1 file of type #{fileClass} found with name '#{name}'"


  toString: =>
    @name

# Non-directory file
class @RegularFile extends File


# Text file, assumed extension .txt
class @TextFile extends RegularFile

  # @param name [String] name of the file (without extension)
  # @param content [String] text content
  constructor: (@name, @content) ->

  toString: =>
    @name + ".txt"

class @DatabaseSim

  # Construct database with tables
  constructor: (@tables = []) ->


class @Table

  # Construct table from row entries
  constructor: (@rows = []) ->

# Computer process simulation
class @Process

  execute: (terminal) =>

