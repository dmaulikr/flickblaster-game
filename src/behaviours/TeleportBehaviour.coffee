
###
Teleport behaviour

An actionable behaviour that teleports the player to the location of a second entity with 'id'
matching its Entity 'target-id' attribute

Read BaseActionableBehaviour and the Actions module for more
###

BaseActionableBehaviour = require './BaseActionableBehaviour'

class TeleportBehaviour extends BaseActionableBehaviour

  constructor: (@entity, @world) ->
    super

    @sprite = @entity.sprites[0]          # The teleport Sprite element
    @lights = @sprite.decorators.lights   # The lights decorator element

  activate: (player) ->
    return if @active

    super

    # Find the teleport's target
    if @entity.hasAttr 'target-id'
      target = @world.getItemById @entity.attributes['target-id']

    playerSprite = player.sprites[0].el

    if target?
      @lightsFx()

      # Animate target as well if it's another teleport
      if target.attributes.type? and target.attributes.type is 'teleport'
        target.behaviour.lightsFx 200

      # Quickly fade player out
      playerSprite.transition opacity: 0, 30, =>
        # Change player's location
        player.body.moveTo target.position()
        # Slowly fade player back in
        playerSprite.transition opacity: 1, 30

  # Effect that fade and rotates the lights
  lightsFx: (delay = 0) ->
    @active = true

    setTimeout ( =>
      (@lights.css opacity: 0, rotation: 0).show().stop().transition opacity: 1, rotate: 90, 100, 'easeOutCirc', =>
        @active = false
        @lights.stop().transition opacity: 0, rotate: 180, 200, 'easeInCirc'
    ), delay

  update: ->

module.exports = TeleportBehaviour