{ json, log, p, pjson } = require 'lightsaber'
{ compact, isEmpty } = require 'lodash'
neo4j = require './neo4j'
Ipfs = require './ipfs'

class Adaptors
  configure: ->
    Ipfs.create()
      .catch (err) => console.warn "No IPFS found: #{err}"
      .then (@ipfs) => @ipfs
      .then => neo4j.create()
      .catch (err) => console.warn "Neo4j not found: #{err}"
      .then (@neo4j) => @neo4j
      .then =>
        @adaptors = compact [
          @ipfs
          @neo4j
        ]
        @get()
      .then (adaptors) =>
        log "Loaded adaptors:"
        for adaptor in adaptors
          log "  - #{adaptor.name()}"
      .catch (e) =>
        console.error e

  get: ->
    if not @adaptors?
      throw new Error "Adaptors have not been configured, please call #configure(...) first"
    else if isEmpty @adaptors
      throw new Error "No adaptors found"
    else
      @adaptors

instance = new Adaptors
module.exports = instance
