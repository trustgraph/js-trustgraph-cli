{log, p, pjson} = require 'lightsaber'
{ first, flatten, unique } = require 'lodash'
Promise = require 'bluebird'
trustExchange = require './trustExchange'

class Reputation

  @ratingsOf: (identity) ->
    ratingSets = for adaptor in trustExchange.adaptors()
      adaptor.ratingsOf identity
    Promise.all ratingSets
      .then (ratingSets) -> unique flatten ratingSets

  @report: (identity) ->
    @ratingsOf identity
      .then (ratings) =>
        reportLines = for {source, target, value, content} in ratings
          value *= 100
          "  - #{value}% #{content} (from #{source})"
        report = if reportLines.length > 0
          "#{identity} has ratings:\n#{reportLines.join "\n"}"
        else
          "#{identity} does not yet have any ratings..."

module.exports = Reputation
