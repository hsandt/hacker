# require "game.js"

class @Mission

  # @param title [String] mission title
  # @param onStart [Function()] called when the mission starts
  # @param onComplete [Function()] called when the mission is completed
  constructor: (@title, @onStart, @onComplete) ->
