// Generated by CoffeeScript 1.6.1
(function() {
  var CollisionManager, Lasers, Layer, Loop, Viewport, Walls, World, debug, debugHelpers, defaults, device, gameData, phys, renderer;

  device = require('../core/device');

  renderer = require('../core/renderer');

  debug = require('../core/debug');

  debugHelpers = require('../helpers/debug');

  gameData = require('./utils/gameData');

  phys = require('./utils/physics');

  Layer = require('./components/Layer');

  Loop = require('./components/Loop');

  Viewport = require('./components/Viewport');

  Walls = require('./components/Walls');

  Lasers = require('./components/Lasers');

  CollisionManager = require('./components/CollisionManager');

  defaults = {
    gravity: [0, 0]
  };

  /*
  ## World class
  
  Ties together level data, physics, game loop, stage element, game layers and game items
  */


  World = (function() {

    function World(wrap, levelId, options) {
      var _this = this;
      this.wrap = wrap;
      if (options == null) {
        options = {};
      }
      this.ready = false;
      this.readyCallbacks = [];
      options = $.extend(true, {}, defaults, options);
      this.gravity = options.gravity;
      this.items = [];
      this.layers = {};
      this.stage = ($(renderer.render('game-stage'))).appendTo(this.wrap);
      this.loop = new Loop;
      this.initPhysics();
      this.loadLevel(levelId);
      this.onReady(function() {
        return _this.start();
      });
    }

    World.prototype.initPhysics = function() {
      var fps;
      fps = this.loop.getFPS();
      this.gravity = new phys.Vector(this.gravity[0], this.gravity[1]);
      this.b2dWorld = new phys.World(this.gravity, true);
      return this.collisionManager = new CollisionManager(this);
    };

    World.prototype.playPhysics = function() {
      var _this = this;
      return this.b2dInterval = window.setInterval(function() {
        _this.b2dWorld.Step(1 / 60, 10, 10);
        return _this.b2dWorld.ClearForces();
      }, 1000 / 60);
    };

    World.prototype.onReady = function(callback) {
      this.readyCallbacks.push(callback);
      if (this.ready) {
        return callback();
      }
    };

    World.prototype.loadLevel = function(levelId, callback) {
      var _this = this;
      return gameData.loadLevel(levelId, function(level) {
        var body, cb, entity, laser, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _results;
        _this.level = level;
        _this.viewport = new Viewport(_this.stage, _this.level.size[0], _this.level.size[1]);
        _this.addLayer('lasers', 'entity');
        _this.addLayer('entities', 'entity');
        _this.walls = new Walls(_this);
        _this.lasers = new Lasers(_this, _this.getLayerById('lasers'));
        _ref = (_this.loadLayerData('entities')).items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          entity = _ref[_i];
          _this.addItem('entities', entity);
        }
        _ref1 = (_this.loadLayerData('walls')).items;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          body = _ref1[_j];
          _this.walls.add(body);
        }
        _this.walls.refresh();
        _ref2 = (_this.loadLayerData('lasers')).items;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          laser = _ref2[_k];
          entity = _this.addItem('lasers', laser);
          entity.elements = _this.lasers.add(laser);
        }
        _this.lasers.refresh();
        _this.ready = true;
        _ref3 = _this.readyCallbacks;
        _results = [];
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          cb = _ref3[_l];
          _results.push(cb());
        }
        return _results;
      });
    };

    World.prototype.addItem = function(layerId, item) {
      var layer;
      layer = this.getLayerById(layerId);
      item = layer.add(item);
      this.items.push(item);
      return item;
    };

    World.prototype.loadLayerData = function(layerId) {
      var layer, _i, _len, _ref;
      if (layerId != null) {
        _ref = this.level.layers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          layer = _ref[_i];
          if (layer.id === layerId) {
            return layer;
          }
        }
      }
      return null;
    };

    World.prototype.addLayer = function(id, type) {
      return this.layers[id] = new Layer(this, type, id);
    };

    World.prototype.getLayerById = function(layerId) {
      if (this.layers[layerId]) {
        return this.layers[layerId];
      }
      return null;
    };

    World.prototype.addBody = function(body) {
      return this.b2dWorld.CreateBody(body.bodyDef).CreateFixture(body.fixtureDef);
    };

    World.prototype.getItemById = function(id) {
      var item, _i, _len, _ref;
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.id === id) {
          return item;
        }
      }
      return null;
    };

    World.prototype.getItemsByAttr = function(attr, value) {
      var item, matches, _i, _len, _ref;
      matches = [];
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.attributes != null) {
          if ((_.has(item.attributes, attr)) && item.attributes[attr] === value) {
            matches.push(item);
          }
        }
      }
      return matches;
    };

    World.prototype.start = function() {
      var _this = this;
      this.initBehaviours();
      this.loop.use(function() {
        return _this.update();
      });
      if (debug.debugPhysics) {
        return debugHelpers.initPhysicsDebugger(this);
      }
    };

    World.prototype.play = function() {
      this.playPhysics();
      return this.loop.play();
    };

    World.prototype.stop = function() {
      this.loop.pause();
      return clearInterval(this.b2dInterval);
    };

    World.prototype.initBehaviours = function() {
      var item, _i, _len, _ref, _results;
      _ref = this.items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.itemType === 'entity') {
          _results.push(item.initBehaviour());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    World.prototype.update = function() {
      var layer, layerId, _ref, _results;
      _ref = this.layers;
      _results = [];
      for (layerId in _ref) {
        layer = _ref[layerId];
        _results.push(layer.update());
      }
      return _results;
    };

    return World;

  })();

  module.exports = World;

}).call(this);